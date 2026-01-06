import React, { useState, useEffect } from 'react';
import Widget from './Widget';
import { LayersIcon } from './Icons';

interface AccountStatusWidgetProps {
  balance: number;
  riskPerTrade: number; // as percentage
  onRiskChange: (risk: number) => void;
  onBalanceChange: (balance: number) => void;
}

const USD_TO_IDR_RATE = 16250;

const formatNumber = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) return '';
    return new Intl.NumberFormat('en-US').format(Math.trunc(num));
};

const parseFormattedNumber = (formatted: string): number => {
    return Number(formatted.replace(/,/g, ''));
};


const AccountStatusWidget: React.FC<AccountStatusWidgetProps> = ({ balance, riskPerTrade, onRiskChange, onBalanceChange }) => {
    const [selectedCurrency, setSelectedCurrency] = useState<'IDR' | 'USD'>('IDR');
    
    const [balanceInput, setBalanceInput] = useState<string>('');
    const [riskAmountInput, setRiskAmountInput] = useState<string>('');
    const [riskPercentInput, setRiskPercentInput] = useState<string>(riskPerTrade.toFixed(2));
    
    useEffect(() => {
        const displayBalance = selectedCurrency === 'IDR' ? balance * USD_TO_IDR_RATE : balance;
        setBalanceInput(formatNumber(displayBalance));
    }, [balance, selectedCurrency]);

    useEffect(() => {
       setRiskPercentInput(riskPerTrade.toFixed(2));
       const riskAmount = (balance * riskPerTrade / 100);
       const displayRiskAmount = selectedCurrency === 'IDR' ? riskAmount * USD_TO_IDR_RATE : riskAmount;
       setRiskAmountInput(formatNumber(displayRiskAmount));
    }, [balance, riskPerTrade, selectedCurrency]);


    const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setBalanceInput(formatNumber(Number(rawValue)));
        
        const numericValue = Number(rawValue);
        if (!isNaN(numericValue)) {
            const newBalanceUSD = selectedCurrency === 'IDR' ? numericValue / USD_TO_IDR_RATE : numericValue;
            onBalanceChange(newBalanceUSD);
        }
    };
    
    const handleRiskPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRiskPercentInput(value); // Allow user to type freely

        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
            onRiskChange(numericValue);
        }
    };
    
    const handleRiskAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setRiskAmountInput(formatNumber(Number(rawValue)));

        const numericValue = Number(rawValue);
        if (!isNaN(numericValue) && balance > 0) {
            const riskAmountUSD = selectedCurrency === 'IDR' ? numericValue / USD_TO_IDR_RATE : numericValue;
            const newRiskPercent = (riskAmountUSD / balance) * 100;

            if (newRiskPercent >= 0 && newRiskPercent <= 100) {
                onRiskChange(newRiskPercent);
            }
        }
    };
    
    const InputField: React.FC<{
        label: string, 
        value: string, 
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
        onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void,
        prefix?: string, 
        suffix?: string, 
        placeholder?: string,
        type?: string
    }> = ({ label, value, onChange, onBlur, prefix, suffix, placeholder, type = "text" }) => (
        <div className="bg-[var(--color-input-bg)] p-2 rounded-md">
            <div className="text-xs text-[var(--color-text-secondary)] uppercase mb-1">{label}</div>
            <div className="relative flex items-center">
                {prefix && <span className="text-lg text-[var(--color-text-tertiary)] mr-2">{prefix}</span>}
                <input 
                    type={type}
                    inputMode={type === "text" ? "text" : "decimal"}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={(e) => e.target.select()}
                    placeholder={placeholder}
                    className="bg-transparent text-xl font-bold text-[var(--color-text)] w-full focus:outline-none"
                />
                 {suffix && <span className="text-lg text-[var(--color-text-tertiary)] ml-2">{suffix}</span>}
            </div>
        </div>
    );

    return (
        <Widget title="Account & Risk Control" icon={<LayersIcon />}>
            <div className="h-full flex flex-col justify-between font-mono p-1 space-y-3 text-sm">
                <div>
                    <InputField 
                        label="Account Balance"
                        value={balanceInput}
                        onChange={handleBalanceChange}
                        onBlur={() => { // Re-format on blur to clean up
                            const displayBalance = selectedCurrency === 'IDR' ? balance * USD_TO_IDR_RATE : balance;
                            setBalanceInput(formatNumber(displayBalance));
                        }}
                        prefix={selectedCurrency === 'IDR' ? 'Rp' : '$'}
                        placeholder="0"
                        type="text"
                    />
                    <div className="flex justify-end mt-1">
                         <div className="flex items-center text-[10px] font-bold p-0.5 bg-[var(--color-input-bg)] rounded-md">
                            <button onClick={() => setSelectedCurrency('IDR')} className={`px-2 py-0.5 rounded ${selectedCurrency === 'IDR' ? 'bg-white/10 text-[var(--color-text)]' : 'text-[var(--color-text-tertiary)]'}`}>IDR</button>
                            <button onClick={() => setSelectedCurrency('USD')} className={`px-2 py-0.5 rounded ${selectedCurrency === 'USD' ? 'bg-white/10 text-[var(--color-text)]' : 'text-[var(--color-text-tertiary)]'}`}>USD</button>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                     <InputField 
                        label="Risk"
                        value={riskPercentInput}
                        onChange={handleRiskPercentChange}
                        onBlur={() => setRiskPercentInput(riskPerTrade.toFixed(2))}
                        suffix="%"
                        placeholder='1.00'
                        type="number"
                    />
                     <InputField 
                        label="Risk Amount"
                        value={riskAmountInput}
                        onChange={handleRiskAmountChange}
                        onBlur={() => {
                            const riskAmount = (balance * riskPerTrade / 100);
                            const displayRiskAmount = selectedCurrency === 'IDR' ? riskAmount * USD_TO_IDR_RATE : riskAmount;
                            setRiskAmountInput(formatNumber(displayRiskAmount));
                        }}
                        prefix={selectedCurrency === 'IDR' ? 'Rp' : '$'}
                        placeholder='0'
                        type="text"
                    />
                </div>
                <div className="text-center text-[var(--color-text-tertiary)] text-[10px] pt-1">
                    Risk parameters are used for AI calculations.
                </div>
            </div>
        </Widget>
    );
};

export default AccountStatusWidget;
