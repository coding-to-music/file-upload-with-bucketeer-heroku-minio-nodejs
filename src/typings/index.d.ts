declare module 'pg-database-url' {
  type Options = {
    password?: string;
    username: string;
    host?: string;
    port?: string;
    database: string;
  };

  function toURL(input: Options): string;

  export default toURL;
}
