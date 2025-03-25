import { implementsInterface } from "../helpers/string-helper"
import { Cast, IDefinesCollections } from "./cast"

class TestForCast {
    aString:string = null
    aNumber:number = null
    aBoolean:boolean = null    

    returnHello() : string {
        return "Hello"
    }
}

class TestForCollections implements IDefinesCollections {
    defineCollections() {
        return {
            "collection": TestForCast
        }
    }
    collection: TestForCast[]
}

class TestForCollectionsRecoursive implements IDefinesCollections {
    defineCollections() {
        return {
            "collectionRecoursive": TestForCollections
        }
    }
    collectionRecoursive: TestForCollections[]
} 

describe("Cast", () => {
    let testForCast : TestForCast
    
    it('should create ', () => {
        testForCast = Cast.cast(TestForCast, {})
        expect(testForCast).toBeTruthy();
      });

    it('should cast properties with same name ', () => {
        const randomNumber = Math.random() * 1000
        const randomBoolean = Math.random() > 5 ? true : false
        const randomString = "Random string"
        testForCast = Cast.cast(TestForCast, {
            "aString": randomString, 
            "aNumber" : randomNumber,
            "aBoolean" : randomBoolean 
        })
        expect(testForCast.aString).toEqual(randomString);
        expect(testForCast.aNumber).toEqual(randomNumber);
        expect(testForCast.aBoolean).toEqual(randomBoolean);
      });

      it('target object should be able to access methods ', () => {
        const randomNumber = Math.random() * 1000
        const randomBoolean = Math.random() > 5 ? true : false
        const randomString = "Random string"
        testForCast = Cast.cast(TestForCast, {
            "aString": randomString, 
            "aNumber" : randomNumber,
            "aBoolean" : randomBoolean
        })
        expect(testForCast.returnHello()).toEqual("Hello");        
      });

    it('should convert from snake to cammel case', () => {
        const randomNumber = Math.random() * 1000
        const randomBoolean = Math.random() > 5 ? true : false
        const randomString = "Random string"
        testForCast = Cast.cast(TestForCast, {            
            "a_String": randomString, 
            "a_number" : randomNumber,
            "a_boolean" : randomBoolean
        })
        expect(testForCast.aString).toEqual(randomString);
        expect(testForCast.aNumber).toEqual(randomNumber);
        expect(testForCast.aBoolean).toEqual(randomBoolean);
    })

    it('should ignore non existent properties', () => {
        const randomNumber = Math.random() * 1000
        const randomBoolean = Math.random() > 5 ? true : false
        const randomString = "Random string"
        testForCast = Cast.cast(TestForCast, {
            "stringer": randomString, 
            "a_number" : randomNumber,
            "a_boolean" : randomBoolean
        })
        expect(testForCast["stringer"]).toBeUndefined();
        expect(testForCast.aNumber).toEqual(randomNumber);
        expect(testForCast.aBoolean).toEqual(randomBoolean);
    })

    it('IDefineCollections works', () => {
        let testForCollectionCast : TestForCollections = Cast.cast(TestForCollections, {})
        let collections = testForCollectionCast.defineCollections()
        expect(collections.hasOwnProperty("collection")).toBeTrue()
        expect(collections.collection).toBeTruthy()
        expect(implementsInterface<IDefinesCollections>(testForCollectionCast, "defineCollections")).toBeTrue()
        
    })

    
    it('should create collections', () => {
        let testForCollectionCast : TestForCollections
        testForCollectionCast = Cast.cast(TestForCollections, {
            "collection": [
                Cast.cast(TestForCast, {}),
                Cast.cast(TestForCast, {}),
                Cast.cast(TestForCast, {})
            ]
        })
        expect(testForCollectionCast.collection).toBeTruthy()
        expect(testForCollectionCast.collection[0]).toBeInstanceOf(TestForCast)        
    })

    it('should work when collections are not defined', () => {
        let testForCollectionCast : TestForCollections
        testForCollectionCast = Cast.cast(TestForCollections, {
            
        })
        expect(testForCollectionCast).toBeTruthy()   
    })

    it('should create collections recoursively', () => {
        let testForCollectionCastRecoursive : TestForCollectionsRecoursive
        testForCollectionCastRecoursive = Cast.cast(TestForCollectionsRecoursive, {
            "collection_recoursive": [
                {
                    "collection": [
                        Cast.cast(TestForCast, {}),
                        Cast.cast(TestForCast, {}),
                        Cast.cast(TestForCast, {})
                    ]
                }
            ]
        })
        expect(testForCollectionCastRecoursive.collectionRecoursive).toBeTruthy()
        expect(testForCollectionCastRecoursive.collectionRecoursive[0]).toBeInstanceOf(TestForCollections) 
        expect(testForCollectionCastRecoursive.collectionRecoursive[0].collection[0]).toBeInstanceOf(TestForCast)           
    })
})