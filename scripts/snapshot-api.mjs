import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Offline snapshot of the DTOs/controllers. The live Springdoc document remains authoritative.
const source = resolve(process.argv[2] ?? '../gestao-frotas', 'src/main/java/br/com/gestaofrota');
const schemas = {};
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const schema = (javaType) => {
  const type = javaType.trim();
  if (/^(List|Set)<.+>$/.test(type)) {
    return { type: 'array', items: schema(type.slice(type.indexOf('<') + 1, -1)) };
  }
  if (type.startsWith('ResponseEntity<')) return schema(type.slice(15, -1));
  if (type.startsWith('PageResponse<')) {
    return {
      type: 'object',
      required: ['content', 'page', 'size', 'totalElements', 'totalPages'],
      properties: {
        content: { type: 'array', items: schema(type.slice(13, -1)) },
        ...Object.fromEntries(
          ['page', 'size', 'totalElements', 'totalPages'].map((key) => [key, { type: 'integer' }]),
        ),
      },
    };
  }
  if (type.startsWith('Map<'))
    return { type: 'object', additionalProperties: { type: 'array', items: ref('Permission') } };
  if (['int', 'Integer', 'long', 'Long'].includes(type)) return { type: 'integer' };
  if (['boolean', 'Boolean'].includes(type)) return { type: 'boolean' };
  if (['String', 'UUID', 'Instant', 'LocalDate'].includes(type)) {
    return {
      type: 'string',
      ...({
        UUID: { format: 'uuid' },
        Instant: { format: 'date-time' },
        LocalDate: { format: 'date' },
      }[type] ?? {}),
    };
  }
  return ref(type);
};

for (const file of readdirSync(resolve(source, 'domain/enums'))) {
  const text = readFileSync(resolve(source, 'domain/enums', file), 'utf8');
  const match = text.replace(/\/\/[^\n]*/g, '').match(/enum (\w+)\s*\{([^}]+)\}/);
  if (match)
    schemas[match[1]] = {
      type: 'string',
      enum: match[2]
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    };
}

for (const folder of ['requests', 'responses']) {
  for (const file of readdirSync(resolve(source, 'api/v1/dtos', folder))) {
    const text = readFileSync(resolve(source, 'api/v1/dtos', folder, file), 'utf8');
    if (file === 'PageResponse.java') continue;
    const match = text.match(/public record (\w+)\s*\(([\s\S]*?)\)\s*\{/);
    if (!match) throw new Error(`Cannot read DTO ${file}`);
    const properties = {};
    const required = [];
    for (const field of match[2].replace(/@\w+(?:\([^)]*\))?\s*/g, '').split(',')) {
      const [type, name] = field.trim().split(/\s+/);
      if (!type || !name) throw new Error(`Cannot read field ${field}`);
      properties[name] = schema(type);
      const optionalResponse =
        folder === 'responses' &&
        ((file === 'VehicleResponse.java' && name === 'sectorId') ||
          (file === 'RouteResponse.java' &&
            ['realStartAt', 'realEndAt', 'startMileage', 'endMileage'].includes(name)) ||
          (file === 'VehicleDocumentResponse.java' &&
            ['documentNumber', 'issuedOn'].includes(name)));
      const optionalRequest =
        folder === 'requests' &&
        ((name === 'sectorId' && file.includes('Vehicle')) ||
          ['plannedDurationMinutes', 'plannedReturnAt', 'documentNumber'].includes(name) ||
          (name === 'issuedOn' && file.includes('Vehicle')) ||
          (name === 'password' && file === 'UpdateUserRequest.java'));
      if (optionalResponse || optionalRequest)
        properties[name] = { ...properties[name], nullable: true };
      if (!optionalRequest) required.push(name);
    }
    schemas[match[1]] = { type: 'object', properties, required };
  }
}

const paths = {};
for (const file of readdirSync(resolve(source, 'api/v1/controllers'))) {
  const text = readFileSync(resolve(source, 'api/v1/controllers', file), 'utf8');
  const base = text.match(/@RequestMapping\("([^"\n]+)"\)/)?.[1];
  if (!base) continue;
  const pattern =
    /@(Get|Post|Put|Patch|Delete)Mapping(?:\("([^"\n]*)"\))?([\s\S]*?)(?=\n\s*@(Get|Post|Put|Patch|Delete)Mapping|\n\}\s*$)/g;
  for (const match of text.matchAll(pattern)) {
    const [, verb, suffix = '', body] = match;
    // These three mappings have identical path patterns and inconsistent path variable names.
    if (suffix.startsWith('find/')) continue;
    const method = body.match(/public\s+(.+?)\s+(\w+)\(/);
    if (!method) throw new Error(`Cannot read operation in ${file}`);
    const path = base + suffix;
    const parameters = [...path.matchAll(/\{(\w+)\}/g)].map((item) => ({
      name: item[1],
      in: 'path',
      required: true,
      schema: item[1] === 'role' ? ref('UserRole') : { type: 'string', format: 'uuid' },
    }));
    for (const param of body.matchAll(/@RequestParam(?:\(([^)]*)\))?\s+(\w+)\s+(\w+)/g)) {
      parameters.push({ name: param[3], in: 'query', required: false, schema: schema(param[2]) });
    }
    const request = body.match(/@RequestBody\s+(\w+)\s+\w+/);
    const noContent = method[1] === 'ResponseEntity<Void>';
    const status = noContent ? '204' : body.includes('ResponseEntity.created') ? '201' : '200';
    const operation = {
      operationId: `${file.replace('.java', '')}_${method[2]}`,
      parameters,
      ...(request
        ? {
            requestBody: {
              required: true,
              content: { 'application/json': { schema: schema(request[1]) } },
            },
          }
        : {}),
      responses: {
        [status]: {
          description: 'Success',
          ...(noContent ? {} : { content: { 'application/json': { schema: schema(method[1]) } } }),
        },
        default: {
          description: 'Problem Detail',
          content: {
            'application/problem+json': { schema: { type: 'object', additionalProperties: true } },
          },
        },
      },
    };
    paths[path] ??= {};
    paths[path][verb.toLowerCase()] = operation;
  }
}
mkdirSync('openapi', { recursive: true });
writeFileSync(
  'openapi/gestao-frotas.json',
  JSON.stringify(
    {
      openapi: '3.0.3',
      info: { title: 'Gestão de frotas — snapshot dos controllers e DTOs', version: '1' },
      paths,
      components: { schemas },
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Snapshot: ${Object.keys(paths).length} paths. Driver find/{...} mappings omitted (ambiguous in backend).`,
);
