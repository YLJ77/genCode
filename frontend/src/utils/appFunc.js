import chineseToPinyin from 'chinese-to-pinyin'

export function toPinyin(chinese) {
    return chineseToPinyin(chinese, {keepRest: true,removeTone: true}).split(/\s/)
        .reduce((acc, str) => {
            acc += upCase0(str);
            return acc;
        }, '');
}

export const upCase0 = str => {
    return str[0].toUpperCase() + str.slice(1)
}

export function updateState(state, list) {
    function getTarget(target, key) {
        return target[key];
    }

    list.forEach(entry => {
        const {key, value, callback} = entry;
        const keys = key.split(".");
        let target = state;
        if (keys.length > 1) {
            for (let i = 0; i < keys.length - 1; i++) {
                target = getTarget(target, keys[i]);
            }
        }
        target[keys[keys.length - 1]] = value;
        if (callback) callback();
    });
}

export const genFormAndRules = (cfgList) => {
    return cfgList.reduce((acc,cfg) => {
        if (cfg.decorator) {
            const {decorator:[decoratorId, {rules,initialValue} = {rules:[]}]} = cfg;
            acc.model[decoratorId] = initialValue;
            acc.rules[decoratorId] = rules;
        }
        return acc;
    }, {model:{},rules:{}})
}
