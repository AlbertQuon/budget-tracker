import React from "react";
import { useField } from "formik";
import DatePicker from "react-datepicker";

export const DatePickerField = ({...props}) => {
    const [field,, {setValue}] = useField(props); // ignoring errors
    return (
        <DatePicker {...field} {...props} 
            minDate={Date.now()} selected={(field.value && new Date(field.value)) || null} onChange={(date) => {setValue(date);}}
        />
    )
}