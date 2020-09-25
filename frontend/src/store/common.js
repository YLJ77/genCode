import { updateState } from '@/utils/appFunc'

export default {
    namespaced: true,
    state: {
        globalAlert: {
            visible: false,
            msg: null,
            msgList: []
        },
    },
    mutations: {
        updateCommonState: updateState,
    },
}

