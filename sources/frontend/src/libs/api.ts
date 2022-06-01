import * as types from '../../../shared/types';

class API {
  #urlBase: string;

  constructor(urlBase: string) {
    this.#urlBase = urlBase;
  }

  async getMessage(
    props: types.API['Greeting']['Request']
  ): Promise<types.API['Greeting']['Response']> {
    const query = new URLSearchParams();
    query.set('message', props.message);
    const res = await fetch(`${this.#urlBase}/greeting?${query}`, {
      mode: 'cors',
    });
    return await res.json();
  }
}

export default API;
