import React from 'react';

type Env = {
  apiUrlBase: string;
};

const hook = () => {
  const [loading, setLoading] = React.useState(true);
  const [env, setEnv] = React.useState<Env>();

  React.useEffect(() => {
    fetch('env.json')
      .then((res) => {
        res.json().then((json) => {
          setEnv(json);
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    loading,
    env,
  };
};

export default hook;
