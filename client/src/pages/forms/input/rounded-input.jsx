import React from 'react';
import Textinput from "@/components/ui/Textinput";
const RoundedInput = () => {
    return (
        <Textinput
            type="text"
            placeholder="Username"
            className="rounded-full px-4"
        />
    );
};

export default RoundedInput;