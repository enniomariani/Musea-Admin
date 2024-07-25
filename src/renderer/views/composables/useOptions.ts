import {Ref, ref} from 'vue';

export interface IOption {
    isRed: boolean
    text: string
    icon: string
    onOptionClick: Function
    selectedOption?: string
    dropDownOptions?: string[]
    checkSelectedOption?: (id: number, title: string, type: string) => string
    condition?: (id: number, title: string, type: string) => boolean | null
}

export function useOptions(showOptions: Ref<boolean>) {
    const optionsOpenForId = ref<number>(-1);
    const optionsOpenForTitle = ref<string>("");
    const optionsOpenForType = ref<string>("");

    const registeredOptions = ref<IOption[]>([]);
    const activeRegisteredOptions = ref<IOption[]>([]);

    function registerOption(optionName: string, icon: string, isRed: boolean, onOptionClick: Function, condition?: (id: number, title: string, type: string) => boolean | null) {
        registeredOptions.value.push({
            text: optionName,
            icon: icon,
            isRed: isRed,
            onOptionClick: onOptionClick,
            condition: condition
        })
    }

    function registerDropDownOption(optionName: string, icon: string, onOptionClick: Function, dropDownOptions: string[], checkSelectedOption: (id: number, title: string, type: string) => string, condition?: (id: number, title: string, type: string) => boolean | null) {
        registeredOptions.value.push({
            text: optionName,
            icon: icon,
            isRed: false,
            dropDownOptions: dropDownOptions,
            checkSelectedOption: checkSelectedOption,
            onOptionClick: onOptionClick,
            condition: condition
        })
    }

    function handleOpenOptions(id: number, title: string, type: string) {
        optionsOpenForId.value = id;
        optionsOpenForTitle.value = title;
        optionsOpenForType.value = type;
        showOptions.value = true;

        activeRegisteredOptions.value = [];

        for (let i:number = 0; i < registeredOptions.value.length; i++) {
            const option: IOption = registeredOptions.value[i];

            if (!option.condition || option.condition(id, title, type) as boolean)
                activeRegisteredOptions.value.push(option)
        }

        for (let i:number = 0; i < activeRegisteredOptions.value.length; i++) {
            const option: IOption = activeRegisteredOptions.value[i];
            option.selectedOption = option.checkSelectedOption ? option.checkSelectedOption(id, title, type) : "";
        }
    }

    function handleSelectedOption(text: string) {
        activeRegisteredOptions.value.find((option: IOption) => option.text === text)?.onOptionClick();
    }

    function handleSelectedDropDown(text: string) {
        activeRegisteredOptions.value.find((option: IOption) => option.dropDownOptions &&
            option.dropDownOptions.find((el) => el === text))?.onOptionClick(text);
    }

    return {
        handleOpenOptions,

        handleSelectedOption,
        handleSelectedDropDown,

        registerOption,
        registerDropDownOption,

        activeRegisteredOptions,

        optionsOpenForId,
        optionsOpenForTitle,
        optionsOpenForType
    }
}