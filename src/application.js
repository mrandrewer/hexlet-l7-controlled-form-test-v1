import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';

const routes = {
  usersPath: () => '/users',
};

const errorMessages = {
  network: {
    error: 'Network Problems. Try again.',
  },
};

const schema = yup.object().shape({
  name: yup.string().trim().required(),
  email: yup.string().required('email must be a valid email').email(),
});

const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return _.keyBy(e.inner, 'path');
  }
};

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

const handleFormErrors = (elements, state) => {
  Object.entries(elements.field).forEach(([fieldName, fieldElement]) => {
    if (!state.form.fieldsUi.touched[fieldName]) { return; }
    const errorMessage = state.form.errors[fieldName] !== undefined
      ? state.form.errors[fieldName].message
      : state.form.errors[fieldName];
    if (errorMessage) {
      fieldElement.classList.add('is-invalid');
      fieldElement.classList.remove('is-valid');
    } else {
      fieldElement.classList.add('is-valid');
      fieldElement.classList.remove('is-invalid');
    }
    const fedebackPart = fieldElement.nextElementSibling;
    if (fedebackPart !== null) {
      fedebackPart.remove();
    }
    const feedbackElement = document.createElement('div');
    feedbackElement.classList.add('invalid-feedback');
    feedbackElement.textContent = errorMessage;
    fieldElement.after(feedbackElement);
  });
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
      fieldsUi: {
        touched: {
          name: false,
          email: false,
        },
      },
      errors: {},
      response: '',
    },
  };

  const elements = {
    container,
    form,
    field: {
      name: document.getElementById('inputName'),
      email: document.getElementById('inputEmail'),
    },
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.processState':
        handleFormState(elements, watchedState);
        break;
      case 'form.errors':
        handleFormErrors(elements, watchedState);
        break;
      default:
        break;
    }
  });

  Object.entries(elements.field).forEach(([fieldName, fieldElement]) => {
    fieldElement.addEventListener('input', (e) => {
      e.preventDefault();
      watchedState.form.processState = 'filling';
      const { value } = e.target;
      watchedState.form.field[fieldName] = value;
      watchedState.form.fieldsUi.touched[fieldName] = true;
      const errors = validate(watchedState.form.field);
      watchedState.form.errors = errors;
    });
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
      watchedState.form.processError = errorMessages.network.error;
    }
  });
};

export default app;
