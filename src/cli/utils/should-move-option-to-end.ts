import convertToBestFitType from '../../utils/convert-to-best-fit-type';

export default function shouldMoveOptionToEnd (argv: string[], optionIndex: number, subOptionsNames: string[]): boolean {
    const isNotLastOption        = optionIndex < argv.length - 1;
    const possibleValue          = argv[optionIndex + 1];
    const isBooleanValueProvided = typeof convertToBestFitType(possibleValue) === 'boolean';

    return isNotLastOption &&
        !isBooleanValueProvided &&
        !subOptionsNames.some(opt => possibleValue.startsWith(opt));
}
