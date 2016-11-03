export interface ComponentConfig {
    id?: string;
    cssClass?: string; // "class" is a reserved keyword, so we need to make the name more complicated
}

export class Component {

    constructor(config: ComponentConfig) {
        console.log(this);
        console.log(config);
    }

}