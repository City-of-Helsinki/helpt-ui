
const ICONS = {
  github: 'fa-github-square',
  trello: 'fa-trello'
}


export function sourceSystemIcon(source) {
  const icon = ICONS[source] || 'fa-question-circle';
  return `fa task-source-icon ${icon}`;
}

export default {
  github: {
    link: (task) => {
      if (!task.workspace) {
        return { url: '', text: '' };
      }
      return {
        url: `https://github.com/${task.workspace.origin_id}/issues/${task.origin_id}`,
        text: `task.workspace.origin_id/{task.origin_id}`,
        icon: sourceSystemIcon('github')
      };
    }
  },
  trello: {
    link: (task) => {
      if (!task.workspace) {
        return { url: '', text: '' };
      }
      return {
        url: `https://trello.com/c/${task.origin_id}`,
        text: task.workspace.name,
        icon: sourceSystemIcon('trello')
      };
    }
  }
};
