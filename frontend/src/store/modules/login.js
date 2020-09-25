import xhr from '@/utils/xhr'

export default {
    namespaced: true,
    actions: {
        //  登录
        async login({}, params) {
            return await xhr.fetch({url: '/user/login', method: 'POST', ...params});
        },
    }
}