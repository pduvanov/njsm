global.njsmfileReport = {
    executedTasks: new Map(),
}

njsm.task('task-001', () => {
    njsmfileReport.executedTasks.set('task-001', true);
});

njsm.task('default', ['task-001'], () => {
    njsmfileReport.executedTasks.set('default', true);
});