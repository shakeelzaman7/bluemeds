/**
 * Defines models that can be used with a Resource
 */
export abstract class Model {

    /**
     * Unique identifier
     */
    public id?: number = null;
    private deletedAt?: string = null;
    
    /**
     * Name of the resource
     */
    abstract resourceName?(): string;

    isDeleted?(): boolean {
        return this.deletedAt === null;
    }
    
    /**
     * Creates a new Model
     * @throws if resourceName is not implemented
     */
    constructor() {
        if(!this.resourceName())
            throw new Error("Model: resourceName can't be null or undefined")
    }
}
