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

const assert = require('assert');

const PROJECT_DIR = process.cwd();

const { Api } = require(`${PROJECT_DIR}/lib/api`);
const { Njsm } = require(`${PROJECT_DIR}/lib/njsm`);
const { Model } = require(`${PROJECT_DIR}/lib/model`);

describe('Integration', () => {
  describe('General', () => {
    it('load and run njsm file', (done) => {
      let model = new Model();
      let api = new Api(model);

      Njsm.createGlobalNjsm(api);

      model.loadNjsmFile('./test/integration/data/njsmfile.js');

      assert.ok(model.getModules().size == 1);
      assert.ok(model.getGlobalNamespace().findTask('default') != null);
      assert.ok(model.getGlobalNamespace().findTask('task-001') != null);

      model.invokeTask('default', (error) => {
        assert.ok(!error);
        assert.ok(njsmfileReport.executedTasks.has('default'));
        assert.ok(njsmfileReport.executedTasks.has('task-001'));
        done(error);
      });

      Njsm.releaseGlobalNjsm();
    });
  });
});