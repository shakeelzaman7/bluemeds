import { camelToSnake, snakeToCamel } from "./string-helper";

describe("String Helper + The \"snakeToCamel\" function", () => {
    it('should convert from cammel case to cammel case', () => {
        expect(snakeToCamel("esta_es_una_pruebita")).toEqual("estaEsUnaPruebita");
      });

    it('should throw when value is null', () => {
        expect(() => snakeToCamel(null)).toThrowError();
      });      
})

describe("String Helper + The \"camelToSnake\" function", () => {
    it('should convert from cammel case to cammel case', () => {
        expect(camelToSnake("estaEsUnaPruebita")).toEqual("esta_es_una_pruebita");
      });

    it('should throw when value is null', () => {
        expect(() => camelToSnake(null)).toThrowError();
      });      
})