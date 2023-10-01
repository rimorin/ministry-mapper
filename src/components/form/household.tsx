import {
  DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE,
  DEFAULT_MULTPLE_OPTION_DELIMITER
} from "../../utils/constants";
import { HouseholdProps, SelectProps } from "../../utils/interface";
import Select from "react-select";

const HouseholdField = ({
  handleChange,
  changeValue,
  options,
  isMultiselect
}: HouseholdProps) => {
  const handleSelectedOptions = (
    changeValue = "",
    options: SelectProps[],
    isMultiselect = DEFAULT_CONGREGATION_OPTION_IS_MULTIPLE
  ) => {
    if (isMultiselect) {
      return [
        isMultiselect,
        changeValue?.split(DEFAULT_MULTPLE_OPTION_DELIMITER).map((value) => {
          return options.find((option) => option.value === value);
        })
      ];
    }
    const hasExistingMultipleValues = changeValue?.includes(
      DEFAULT_MULTPLE_OPTION_DELIMITER
    );
    if (hasExistingMultipleValues) {
      return [
        true,
        changeValue?.split(DEFAULT_MULTPLE_OPTION_DELIMITER).map((value) => {
          return options.find((option) => option.value === value);
        })
      ];
    }

    return [
      isMultiselect,
      options.find((option) => option.value === changeValue)
    ];
  };

  const [isMultiselectValue, selectedOptions] = handleSelectedOptions(
    changeValue,
    options,
    isMultiselect
  );

  return (
    <div className="mb-3">
      <div className="mb-2 inline-block">Household</div>
      <Select
        options={options}
        onChange={handleChange}
        defaultValue={selectedOptions}
        isSearchable={false}
        isMulti={isMultiselectValue as boolean}
        required
      />
    </div>
  );
};

export default HouseholdField;
