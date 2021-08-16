export interface SerializedEntityWithPredicate {
    isPredicate: boolean;
}

export interface SerializedCommand {
    type: string;
    assertionType?: string;
}
