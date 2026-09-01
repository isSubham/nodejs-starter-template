declare module 'swagger-jsdoc' {
  interface Options {
    definition: object;
    apis: string[];
  }
  function swaggerJSDoc(options: Options): object;
  export = swaggerJSDoc;
}
