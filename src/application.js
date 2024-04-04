import onChange from 'on-change';
import i18next from 'i18next';

const render = (container, state, i18n) => {

};

const app = () => {
  const state = {};

  const container = null;

  const i18nextInstance = i18next.createInstance();

  const watchState = onChange(state, () => render(container, watchState, i18nextInstance));

  render(container, watchState, i18nextInstance)
};

export default app;