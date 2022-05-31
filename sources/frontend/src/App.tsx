import React, { useState } from 'react';
import useEnv from './hooks/env';
import API from './libs/api';

function App() {
  const [reply, setReply] = useState<string>();
  const { loading, env } = useEnv();

  React.useEffect(() => {
    if (loading) return;
    if (!env) return;

    new API(env.apiUrlBase)
      .getMessage({
        message: 'Hello',
      })
      .then((res) => {
        setReply(res.reply_message);
      });
  }, [loading, JSON.stringify(env)]);

  if (loading) {
    return <div>Env Loading</div>;
  }

  return <div>{reply && <p>You got a reply!: {reply}</p>}</div>;
}

export default App;
