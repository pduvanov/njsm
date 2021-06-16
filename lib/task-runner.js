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

const async = require('async');
const path = require('path');
const fs = require('fs');

TaskRunner = function(options) {
  let m_globalNamespace =  options.globalNamespace;
  let m_tackChain = new Array();

  this.run = function(taskName, callback) {
    let task = m_globalNamespace.resolveTask(taskName);
    if (task) {
      if (isTaskNeedToInvoke(task)) {
        invokeTask(task, callback);
      } else {
        callback(null);
      }
    } else {
      callback(new Error('Task [' + taskName + '] not found'));
    }
  }

  function invokeTask(task, callback) {
    m_tackChain.push(task.getName());

    runTaskPrereqs(task, (error) => {
      if (!error) {
        runTaskAction(task, (error, result) => {
          if (!error) {
            m_tackChain.pop();
            callback(null, result);
          } else {
            callback(error);
          }
        });
      } else {
        callback(error);
      }
    });
  }

  function runTaskPrereqs(task, callback) {
    let taskPrereqs = task.getPrereqs();
    if (taskPrereqs && taskPrereqs.length) {
      let tasks = [];

      taskPrereqs.forEach((prereqName) => {
        tasks.push((callback) => {
          let prereqTask = resolvePrereqTask(task, prereqName);
          if (prereqTask) {
            if (isTaskNeedToInvoke(prereqTask)) {
              invokeTask(prereqTask, callback);
            } else {
              callback(null);
            }
          } else {
            let prereqFileAbsPath = resolveTaskPrereqFilePath(task, prereqName);
            if (fs.existsSync(prereqFileAbsPath)) {
              callback(null);
            } else {
              callback(new Error('Task [' + prereqName + '] not found'));
            }
          }
        });
      });

      async.series(tasks, callback);
    } else {
      callback(null);
    }
  }

  function runTaskAction(task, callback) {
    task.runAction(callback);
  }

  function resolvePrereqTask(task, prereqName) {
    let namespace = task.getNamespace();
    let prereqTask = namespace.resolveTask(prereqName);
    if (!prereqTask) {
      prereqTask = m_globalNamespace.resolveTask(prereqName);
    }
    return prereqTask;
  }

  function isTaskNeedToInvoke(task) {
    let taskPrereqs = task.getPrereqs();
    if (taskPrereqs && taskPrereqs.length) {
      for (let i = 0; i < taskPrereqs.length; ++i) {
        let prereqName = taskPrereqs[i];
        let prereqTask = resolvePrereqTask(task, prereqName);
        if (prereqTask) {
          if (isTaskNeedToInvoke(prereqTask)) {
            return true;
          }
        } else {
          let prereqFileAbsPath = resolveTaskPrereqFilePath(task, prereqName);
          if (fs.existsSync(prereqFileAbsPath)) {
            if (task.getType() == 'file') {
              let taskFileAbsFile = resolveTaskFilePath(task);
              if (fs.existsSync(taskFileAbsFile)) {
                //  TODO: compare file mod time
              } else {
                return true;
              }
            } else {
              return true;
            }
          } else {
            throw new Error('Prereq file [' + prereqFileAbsPath + '] didn\'t exists');
          }
        }
      }
      return false;
    } else {
      if (task.getType() == 'file') {
        let taskFileAbsFile = resolveTaskFilePath(task);
        return !fs.existsSync(taskFileAbsFile);
      } else {
        return true;
      }
    }
  }

  function resolveTaskPrereqFilePath(task, prereqName) {
    if (path.isAbsolute(prereqName)) {
      return prereqName;
    } 
    return path.resolve(path.dirname(task.getModule().getNjsmFileAbsPath()) + '/' + prereqName);
  }

  function resolveTaskFilePath(task) {
    let taskName = task.getName();
    if (path.isAbsolute(taskName)) {
      return taskName;
    } 
    return path.resolve(path.dirname(task.getModule().getNjsmFileAbsPath()) + '/' + taskName);
  }

};

module.exports.TaskRunner = TaskRunner;
