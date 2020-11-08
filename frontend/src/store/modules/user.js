import xhr from '@/utils/xhr'

export default {
    namespaced: true,
    actions: {
        //  获取用户列表
        async getUserList({}, params) {
            return await xhr.fetch({url: '/user/list', method: 'POST', ...params});
        },
        //  获取用户信息
        async getUserInfo({}, params) {
            params.hideParams = true;
            return await xhr.fetch({url: `/user/${params.params.id}`, method: 'GET', ...params});
        },
        //  更新用户信息
        async updateUser({}, params) {
            return await xhr.fetch({url: `/user/${params.params.id}`, method: 'PATCH', ...params});
        },
        //  删除用户
        async deleteUser({}, params) {
            return await xhr.fetch({url: `/user/${params.params.id}`, method: 'DELETE', ...params});
        },
        //  创建用户
        async addUser({}, params) {
            return await xhr.fetch({url: '/user/add', method: 'POST', ...params});
        },
    }
}
