/*
 * NJSM JavaScript build tool
 * Copyright 2021 Pavel Duvanov
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

const yargs = require('yargs/yargs');
const async = require('async');
const fs = require('fs');

const { Api } = require('./api');
const { Model } = require("./model");

const NJSMFILE_DEFAULT_NAME = 'njsmfile.js';
const TASK_DEFAULT_NAME = 'default';

App = function() {
  let m_options = {};

  configure();

  let m_model = new Model();
  let m_api = new Api(model);

  this.run = function(callback) {
    global.njsm = {};

    Object.assign(njsm, m_api);

    const njsmfilePath = findNjsmFile();
    if (njsmfilePath) {
      try {
        m_model.loadNjsmFile(njsmfilePath);
        let tasks = [];
        m_options.targets.forEach((target) => {
          tasks.push((callback) => {
            m_model.invokeTask(target, callback);
          });
        });
        async.series(tasks, callback);
      } catch(error) {
        callback(error);
      }
    } else {
      callback(new Error('No njsmfile. Specify a valid path with -f/--njsmfile.js, or place one in the current directory.'));
    }
  }

  function configure() {
    const argv = yargs(process.argv.slice(2))
      .option({
        njsmfile: {
          alias: 'f'
        }
      })
      .argv;

    m_options.njsmfile = argv.njsmfile;
    m_options.targets = argv._;

    if (m_options.targets.length == 0) {
      m_options.targets.push(TASK_DEFAULT_NAME);
    }
  }

  function findNjsmFile() {
    if (m_options.njsmfile) {
      return m_options.njsmfile;
    } else {
      return lookUpNjsmFile();
    }
  }

  function lookUpNjsmFile() {
    const njsmFilePath = NJSMFILE_DEFAULT_NAME;
    if (fs.existsSync(njsmFilePath)) {
      return njsmFilePath;
    } else {
      return null;
    }
  }

};

module.exports.App = App;
