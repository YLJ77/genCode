const fs = require('fs');
const path = require('path');

module.exports.genViewPage = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        cfg.fileName = cfg.fileName[0].toUpperCase() + cfg.fileName.slice(1);  // 首字母大写
        let data = `
import React, {Component} from "react";
import {YxListPage} from 'yx-widget'
import {observer,inject} from 'mobx-react'
import {withRouter} from "react-router-dom";
import {get} from "lodash";
import CubeI8N from "utils/cubeI8N";
import './${cfg.fileName}Less.less'
import Serv from './${cfg.fileName}Serv'
    ${cfg.headerTitle}
    `;
        await fs.writeFile(path.join(__dirname, `../output/${cfg.fileName}View.js`), data, err => {
            reject(err);
        })
        resolve();
    })
}
