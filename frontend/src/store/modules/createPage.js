import xhr from '@/utils/xhr'

export default {
    namespaced: true,
    actions: {
        //  添加页面
        async addPage({}, params) {
            return await xhr.fetch({url: '/page/add', method: 'POST', ...params});
        },
        //  上传文件
        async uploadFile({}, params) {
            return await xhr.fetch({url: '/page/upload', method: 'POST', ...params});
        },
        //  替换页面字段
        async replacePageField({}, params) {
            return await xhr.fetch({url: '/page/fieldReplace', method: 'POST', ...params});
        },
        //  获取页面列表
        async getPageList({}, params) {
            return await xhr.fetch({url: '/page/list', method: 'POST', ...params});
        },
        //  获取页面详情
        async getPageInfo({}, params) {
            return await xhr.fetch({url: `/page/${params.params.id}`, method: 'GET', ...params});
        },
        //  修改页面
        async editPage({}, params) {
            return await xhr.fetch({url: `/page/${params.params.id}`, method: 'PATCH', ...params});
        },
        //  删除页面
        async deletePage({}, params) {
            return await xhr.fetch({url: `/page/${params.params.id}`, method: 'DELETE', ...params});
        }
    }
}
