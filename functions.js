export function propsToCSSText (props){
    const getValueStr = (prps, separator = ' ') => {
        let params =  Object.assign([], prps);
        let unit = params.pop();
        let valueStr = params.reduce(function(sum, current, index, arr) {
            current = typeof current !== 'string' && unit == 'px' ? Math.round(current) : current;
            return sum + current + unit + ((index < arr.length - 1 ) ? separator : '');
        }, '');
        return valueStr;
    };
    let CSSText = '';
    for (const prop in props) {
        if(Array.isArray(props[prop])){
            CSSText += `${prop.replace(/[A-Z]/g, "-$&").toLowerCase()}: ${getValueStr(props[prop])}; `;
        }else{
            let str = '';
            for (const part in props[prop]) {
                str += `${part}(${getValueStr(props[prop][part], ', ')}) `;
            }
            CSSText += `${prop.replace(/[A-Z]/g, "-$&").toLowerCase()}: ${str}; `;
        }
    }
    return CSSText;
}

export function calcRelativity(deg){
    deg = Math.round(deg);
    return {
        x: Math.round(Math.cos(deg * Math.PI / 180) * 1000) / 1000,
        y: Math.round(Math.sin(deg * Math.PI / 180) * 1000) / 1000,
    };
}

export function randomizer(min, max){
    return Math.floor((min + Math.random() * (max + 1 - min)));
}

export function roundDegs(deg){
    if(deg >= 360){
        deg = deg - 360;
    }else if (deg < 0){
        deg = deg + 359;
    }
    return deg;
}