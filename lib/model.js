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

const path = require('path');
const fs = require('fs');

const { Module } = require("./module");
const { Namespace } = require("./namespace");
const { TaskRunner } = require("./task-runner");
const { TaskFactory } = require("./task-factory");

const GLOBAL_NAMESPACE_NAME = '';
const NAMESPACE_DELIMITER = ':';

Model = function() {
  let self = this;
  let m_taskFactory = new TaskFactory({
    namespaceDelimiter: NAMESPACE_DELIMITER,
  });
  m_globalNamespace = new Namespace({
    name: GLOBAL_NAMESPACE_NAME,
    delimiter: NAMESPACE_DELIMITER,
  });
  let m_njsmFileContexts = new Array();
  let m_modules = new Map();

  this.loadNjsmFile = function(njsmFilePath) {
    let njsmAbsFilePath = resolveNjsmFilePath(njsmFilePath);
    if (!m_modules.has(njsmAbsFilePath)) {
      if (fs.existsSync(njsmAbsFilePath)) {
        let module = new Module({
          njsmFilePath: njsmFilePath,
          njsmAbsFilePath: njsmAbsFilePath,
        });
        m_modules.set(njsmAbsFilePath, module);
        m_njsmFileContexts.push({
          njsmFilePath: njsmFilePath,
          njsmAbsFilePath: njsmAbsFilePath,
          namespaces: [m_globalNamespace],
          module: module,
        });
        require(njsmAbsFilePath);
        m_njsmFileContexts.pop();
      } else {
        throw Error('File [' + njsmFilePath + '] not found.');
      }
    }
  }

  this.includeNamespaceContent = function(namespaceName, contentClosure) {
    let njsmFileContext = getCurrentNjsmFileContext();
    if (njsmFileContext) {
      let currentNamespace = njsmFileContext.namespaces[njsmFileContext.namespaces.length - 1];
      let namespace = currentNamespace.openNamespace(namespaceName);
      if (contentClosure) {
          njsmFileContext.namespaces.push(namespace);
          contentClosure();
          njsmFileContext.namespaces.pop();
      }
    } else {
      throw new Error('No current Njsm file context');
    }
  }

  this.createTask = function(name, type, prereqs, action, options) {
    let njsmFileContext = getCurrentNjsmFileContext();
    if (njsmFileContext) {
      let currentNamespace = njsmFileContext.namespaces[njsmFileContext.namespaces.length - 1];
      let task = m_taskFactory.createTask(name, type, prereqs, action, options, njsmFileContext.module, currentNamespace);
      currentNamespace.registerTask(task);
    } else {
      throw new Error('No current Njsm file context');
    }
  }

  this.invokeTask = function(name, callback) {
    let taskRunner = new TaskRunner({
      globalNamespace: m_globalNamespace,
      globalNamespaceName: GLOBAL_NAMESPACE_NAME,
      namespaceDelimiter: NAMESPACE_DELIMITER,
    });

    taskRunner.run(name, callback);
  }

  this.findTask = function(name) {
    let names = name.split(NAMESPACE_DELIMITER);

    if (names.length == 1) {
      return self.getGlobalNamespace().findTask(name);
    } else {
      let namespaceName = names[0];
      if (m_namespaces.has(namespaceName)) {
        let namespace = m_namespaces.get(namespaceName);
        names.shift();
        return namespace.findTask(names.join(NAMESPACE_DELIMITER));
      } //  TODO write else: new Error('Namespace not found');
    }

    return null;
  }

  this.getGlobalNamespace = function() {
    return m_namespaces.get(GLOBAL_NAMESPACE_NAME);
  }

  function getCurrentNjsmFileContext() {
    return m_njsmFileContexts.length ? m_njsmFileContexts[m_njsmFileContexts.length - 1] : null;
  }

  function resolveNjsmFilePath(njsmFilePath) {
    if (path.isAbsolute(njsmFilePath)) {
      return njsmFilePath;
    } 

    let njsmFileContext = getCurrentNjsmFileContext();
    if (!njsmFileContext) {
      return path.resolve(njsmFilePath);
    }

    return path.dirname(njsmFileContext.njsmAbsFilePath) + '/' + njsmFilePath;
  }

};

module.exports.Model = Model;
