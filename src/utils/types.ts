export type EnumFromPropertiesOf<T> = {
    [P in keyof T]: Extract<keyof T, P>
}
