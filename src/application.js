import axios from 'axios';
import onChange from 'on-change';

const routes = {
  usersPath: () => '/users',
};

const netWorkError = () => 'Network Problems. Try again.';

const renderForm = (container) => {
  const form = document.createElement('form');
  form.id = 'registrationForm';
  form.innerHTML = `<div class="form-group">
  <label for="inputName">Name</label>
  <input type="text" class="form-control" id="inputName" placeholder="Введите ваше имя" name="name" required>
</div>
<div class="form-group">
  <label for="inputEmail">Email</label>
  <input type="text" class="form-control" id="inputEmail" placeholder="Введите email" name="email" required>
</div>
<input type="submit" value="Submit" class="btn btn-primary">`;

  container.replaceChildren(form);
  return form;
};

const renderSuccess = (elements, state) => {
  const p = document.createElement('p');
  p.textContent = state.form.response;
  elements.container.replaceChildren(p);
};

const handleFormState = (elements, state) => {
  switch (state.form.processState) {
    case 'success':
      renderSuccess(elements, state);
      break;
    default:
      break;
  }
};

const app = () => {
  const container = document.querySelector('.form-container');
  const form = renderForm(container);

  const state = {
    form: {
      processState: '',
      field: {
        name: '',
        email: '',
      },
      response: '',
    },
  };

  const elements = {
    container,
    inputName: document.getElementById('inputName'),
    inputEmail: document.getElementById('inputEmail'),
    form,
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.processState':
        handleFormState(elements, watchedState);
        break;
      default:
        break;
    }
  });

  elements.inputName.addEventListener('input', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'filling';
    const { value } = e.target;
    watchedState.form.field.name = value.trim();
  });

  elements.inputEmail.addEventListener('input', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'filling';
    const { value } = e.target;
    watchedState.form.field.email = value.trim();
  });

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    state.form.processState = 'sending';
    try {
      const response = await axios.post(routes.usersPath(), watchedState.form.field);
      watchedState.form.response = response.data.message;
      watchedState.form.field.name = '';
      watchedState.form.field.email = '';
      watchedState.form.processState = 'success';
    } catch (err) {
      watchedState.form.processState = 'error';
      watchedState.form.processError = netWorkError();
    }
  });
};

export default app;
