import React, {useState} from "react";
import {HexColorPicker,} from "react-colorful";

function ColorPicker(props) {

    

    return (
        <div className="optionHolder">
            <HexColorPicker color = {props.color} onChange={props.setColor}/>
            
        </div>
    );
}

export default ColorPicker;