import { useState } from "react";

export default function useShowPassword(){
    const [showPassword, setShowPassword] = useState(false); 

    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
    }; 

    return {showPassword, toggleShowPassword}
}