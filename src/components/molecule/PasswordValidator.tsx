import { COLORS } from '@/src/colors';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ValidationIcon from '../ValidationIcon';

interface PasswordValidatorProps {
    password: string;
    onChangeStrength?: (strength: string) => void;
    onValidationFulfill?: (val: boolean) => void
    isWhiteMode?: boolean;
    name?: string;
    email?: string;
}

const PasswordValidator = ({ password, onChangeStrength, onValidationFulfill = () => {}, isWhiteMode = false }: PasswordValidatorProps) => {
    const [validators, setValidators] = useState([
        // {
        //     id: 1,
        //     scope: "not_contain_name_or_email",
        //     checked: false,
        //     validator: "Must not contain your name or email",
        // },
        {
            id: 2,
            scope: "at_least_8_characters",
            checked: false,
            validator: "At least 8 characters",
        },
        {
            id: 3,
            scope: "at_least_a_special_and_a_number",
            checked: false,
            validator: "Contains at least a special character and a number",
        },
        {
            id: 4,
            scope: "at_least_a_uppercase",
            checked: false,
            validator: "Contains at least a uppercase letter",
        },
        {
            id: 5,
            scope: "at_least_a_lowercase",
            checked: false,
            validator: "Contains at least a lowercase letter",
        }
    ]);

    useEffect(() => {
        const validateResult = validator(password);
        onChangeStrength ? onChangeStrength(calculateStrength(validateResult)) : null;
    }, [password]);

    const validator = (password: string) => {
        const newValidators = validators.map(item => {
            // if (item.scope === "not_contain_name_or_email") {
            //     const emailUsername = email.split('@')[0];
            //     const lowerPassword = password.toLowerCase();
            //     const lowerEmailUsername = emailUsername.toLowerCase();

            //     let hasName = false;
            //     const nameParts = name.trim().toLowerCase().split(" ");
            //     const lowerCasePassword = password.toLowerCase();
            //     for (const part of nameParts) {
            //         if (lowerCasePassword.includes(part)) {
            //             hasName =  true;
            //         }
            //     }
            //     const hasEmail = lowerPassword.includes(lowerEmailUsername);
            //     return {
            //         ...item,
            //         checked: !(hasName || hasEmail)
            //     };
            // }
            if (item.scope === "at_least_8_characters") {
                return {
                    ...item,
                    checked: password.length > 7
                };
            }
            if (item.scope === "at_least_a_special_and_a_number") {
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                const hasNumber = /\d/.test(password);
                return {
                    ...item,
                    checked: hasSpecialChar && hasNumber
                };
            }
            if (item.scope === "at_least_a_uppercase") {
                const hasUppercase = /[A-Z]/.test(password);
                return {
                    ...item,
                    checked: hasUppercase
                };
            }
            if (item.scope === "at_least_a_lowercase") {
                const hasLowercase = /[a-z]/.test(password);
                return {
                    ...item,
                    checked: hasLowercase
                };
            }
            return item;
        });
        setValidators(newValidators);
        return newValidators
    };

    const calculateStrength = (validateResult: any[]) => {
        const checkedCount = validateResult.filter(validator => validator.checked).length;
        onValidationFulfill(checkedCount === validators?.length)
        if (checkedCount <= 1) {
            return "Weak";
        } else if (checkedCount === 2 || checkedCount === 3) {
            return "Moderate";
        } else {
            return "Strong";
        }
    };

    return (
        <View style={{ gap: 8 }}>
            <Text style={[styles.caption, { color: isWhiteMode ? COLORS.white : COLORS.typographyDefault }]}>Your password must contain:</Text>
            {validators.map(validator => <View key={validator.id} style={{ flexDirection: 'row', gap: 8 }}>
                <ValidationIcon variant={validator.checked} />
                <Text style={[styles.caption, { color: isWhiteMode ? COLORS.caption : COLORS.typographyDefault }]}>{validator.validator}</Text>
            </View>)}

        </View>
    )
}

const styles = StyleSheet.create({
   caption: {
    //  color: COLORS.caption,
     fontSize: 15
   }
});


export default PasswordValidator

