import * as prompt from 'prompt';
import { generate } from 'graphql-code-generator';

interface Credentials {
  username: string;
  password: string;
}

async function getCredentials(): Promise<Credentials> {
  return new Promise<Credentials>(resolve => {
    prompt.start();
    prompt.get(['username', 'password'], (_err, result) => {
      resolve({
        username: result.username,
        password: result.password,
      });
    });
  });
}

function generateHeaders({
  username,
  password,
}: Credentials): Record<string, any> {
  const Authorization = `Basic ${Buffer.from(
    `${username}:${password}`,
  ).toString('base64')}`;

  return { Authorization };
}

async function main() {
  const credentials = await getCredentials();
  const headers = generateHeaders(credentials);

  await generate(
    {
      schema: {
        'http://localhost:4000/graphql': {
          headers,
        },
      },
      documents: './src/graphql/**/*.ts',
      generates: {
        './src/graphql.ts': {
          plugins: [
            'typescript-common',
            'typescript-client',
            'typescript-server',
            'typescript-apollo-angular',
          ],
        },
      },
      overwrite: true,
    },
    true,
  );
}

main();
