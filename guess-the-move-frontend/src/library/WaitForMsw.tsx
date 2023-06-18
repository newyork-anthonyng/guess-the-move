import { useState, useEffect } from 'react';

function Wrapper(Component) {
  if (process.env.NODE_ENV === "development") {
    function NewComponent(props) {
      const [didLoadMsw, setDidLoadMsw] = useState(false);

      useEffect(() => {
        const func = require("../mocks");
        (async() => {
          await func.default;
          setDidLoadMsw(true);
        })();
      }, []);

      if (didLoadMsw) {
        return <Component {...props} />
      } else {
        return null;
      }
    }

    return NewComponent;
  } else {
    return Component;
  }
}

export default Wrapper;