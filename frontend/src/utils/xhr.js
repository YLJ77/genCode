import axios from 'axios'
import commonStore from '@/store/common'
import {message} from "ant-design-vue";

axios.defaults.baseURL = 'http://127.0.0.1:3000';

function getHeader() {
    const pageToken = localStorage.getItem('pageToken');
    if (pageToken) {
        return {
            Authorization: pageToken
        };
    }
    return {}
}

export default class Request {
    static updateState({ msg = '', msgList = [] }) {
        const { mutations: { updateCommonState }, state } = commonStore;
        updateCommonState(state, [
            {
                key: 'globalAlert.visible',
                value: true
            },
            {
                key: 'globalAlert.msg',
                value: msg
            },
            {
                key: 'globalAlert.msgList',
                value: msgList
            },
        ]);
    }
    static fetch({
                     url,
                     method,
                     params = {},
                     data = {},
                     headers = getHeader(),
                     cb = Function.prototype,
                     auth
                 }) {
        if (auth) axios.defaults.headers.accessToken = auth;
        return new Promise((resolve, reject) => {
            const requestInfo = {
                url,
                method,
                headers,
            };
            if (method.toUpperCase() === 'GET') {
                requestInfo.params = params;
            } else {
                requestInfo.data = params;
            }
            cb(true);
            axios.request(requestInfo).then(res => {
                const {data,msg,code} = res.data;
                if (code === 1) {
                    resolve(data);
                } else {
                    message.error(msg)
                }
            }).catch(err => {
                const data = err?.response?.data;
                if (data) {
                    if (typeof data === 'string') {
                        if (data[0].trim() === '<') {
                            let msg = data.match(/<body[^>]*>(.|\n)*<\/body>/gi)?.[0]?.replace(/body/g,'div') || '服务器重启中,请稍后再试！';
                            Request.updateState({msg});
                        } else {
                            Request.updateState({msg: data});
                        }
                    } else {
                        Request.updateState({msg: '', msgList: Object.keys(data).filter((entry, index) => index < 20).reduce((acc, key) => {
                                if (key !== 'timestamp') acc.push({ key, value: data[key] });
                                return acc;
                            }, []) });
                    }
                } else {
                    Request.updateState({msgList: [
                            {key: 'path', value: url},
                            {key: 'msg', value: '未知错误'}
                        ]});
                }
            }).finally(() => {
                cb(false);
            });
        });
    }
}
