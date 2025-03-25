import { camelToSnake, implementsInterface, snakeToCamel } from "../helpers/string-helper";

export interface IDefinesRelationships {
    defineRelationship?(): Object;
}

/**
 * Implement to provide collection information of any property to the {@link Cast.cast} method
 */
export interface IDefinesCollections {
    /**
     * Define collections such as { {nameOfFIeld}: type of Collection }
     */
    defineCollections?(): Object;
}

/**
 * Implements casting for Angular
 * 
 * Note that the 'as' typecast wont work with methods use this class for casting
 */
export class Cast {

    /**
     * Casts any object to the Target type
     * 
     * Ignores objects keys that are not defined in the T object
     * Maps snake_case from the source into camelCase properties in the target
     * If target implements {@link IDefinesCollections} will recoursively generate such collections
     * 
     * @param target type definition to cast
     * @param source the object 
     * 
     * @returns A new instance of type T with values set as the source
     */
    public static cast<T>(target: new() => T, source:Object)
    {
        if(source == null) return null;
        const obj = new target()

        for(let key in source)
        {
            let value = source[key]

            let overrideKey = Cast.getOverrideKey<T>(obj, key);

            if(overrideKey != null)
                obj[overrideKey] = value
            
        }

        if(implementsInterface<IDefinesCollections>(obj, "defineCollections"))
            Cast.castCollections(obj, source);
        
        if(implementsInterface<IDefinesRelationships>(obj, "defineRelationship"))
            Cast.castRelationship(obj, source);
        return obj
    }

    private static castRelationship(obj: IDefinesRelationships, source: Object)
    {
        //if(source) return;

        var relationships = obj.defineRelationship();

        for (let key in relationships) {
            obj[key] = [];
            if (source.hasOwnProperty(key) || source.hasOwnProperty(camelToSnake(key))) {                    
                obj[key] = Cast.cast(relationships[key], source[(source.hasOwnProperty(key) ? key : camelToSnake(key))])
            }
        }
    }

    private static castCollections(obj: IDefinesCollections, source: Object) {
        var collections = obj.defineCollections();

        for (let key in collections) {
            obj[key] = [];
            if (this.sourceHasCollection(key, source)) {                    
                source[(source.hasOwnProperty(key) ? key : camelToSnake(key))].forEach(element => {
                    obj[key].push(Cast.cast(collections[key], element));
                });
            }
        }
    } 

    private static sourceHasCollection(key: string, source:Object)
    {
        return (source.hasOwnProperty(key) || source.hasOwnProperty(camelToSnake(key))) && Array.isArray(source[key] ?? source[camelToSnake(key)])
    }

    private static getOverrideKey<T>(obj: T, key: string) {
        if (obj.hasOwnProperty(key)) {
            return key;
        }

        let cammelKey = snakeToCamel(key);
        if (obj.hasOwnProperty(cammelKey))
            return cammelKey;
        
        return null;
    }

    
}