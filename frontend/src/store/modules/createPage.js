import xhr from '@/utils/xhr'

export default {
    namespaced: true,
    actions: {
        //  添加页面
        async addPage({}, params) {
            return await xhr.fetch({url: '/page/add', method: 'POST', ...params});
        },
        //  添加页面
        async uploadFile({}, params) {
            return await xhr.fetch({url: '/page/upload', method: 'POST', ...params});
        }
    }
}
