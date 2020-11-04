import axios from 'axios'
import {message,Modal} from "ant-design-vue";
import ip from '../../../curIp.txt'
const curIp = ip.trim();
// export const baseUrl = 'http://127.0.0.1:3000';
export const baseUrl = `http://${curIp}:3000`;

axios.defaults.baseURL = baseUrl;

function getHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            Authorization: token
        };
    }
    return {}
}

export default class Request {
    static updateState({ msg = '', msgList = [] }) {
        window.vm.updateCommonState([
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
    static visibleLoginModal(msg) {
        Modal.warn({
            title: '提示',
            content: msg,
            okText: "去登录",
            zIndex: 2000,
            onOk: function () {
                window.vm.config.globalProperties.$router.push('/');
            }
        });
    }
    static fetch({
                     url,
                     method,
                     params = {},
                     headers = {},
                     cb = Function.prototype,
                 }) {
        headers = {
            ...headers,
            ...getHeader()
        }
        return new Promise((resolve) => {
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
                const {msg,code} = res.data;
                if (code === 0) {
                    resolve(res.data);
                } else if (code === -1) {  // 登录过期
                    Request.visibleLoginModal(msg);
                } else {
                    message.error(msg)
                }
            }).catch(err => {
                const {
                    config: {url,method},
                    data: {msg},
                    status, statusText
                } = err?.response;
                const msgList = [
                    {key: 'url', value: url},
                    {key: 'method', value: method},
                    {key: 'status', value: status},
                    {key: 'statusText', value: statusText},
                    {key: 'msg', value: msg},
                ];
                Request.updateState({ msgList });
                /*
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
                */
            }).finally(() => {
                cb(false);
            });
        });
    }
}
