@PLAN.md I want you to make the height of the camera (currently a constant) a value that you can specify, just like you can specify the zoom. If no value is provided for this new parameter the existing "default" (20) should be provided. The default value should remain as a constant (but needs to properly be renamed so that we clear understand that that is a default value).


@PLAN.md the generated image is "upside down". Lines should be farther away in the bootom of the image instead of the top. Im the context of this issue I would also like you to think in a way we can generate a proper prompt to validate the physicality of the image implementation with o3-pro model. Please use git history to search the implementation plan related to the image generation inside the scripts folder so that you can understand the requirements, and write a proper prompt that I can copy and past to o3-pro model so that it does a proper code revision/assessment and validates if the implementation is sound and grounded on physics.



I checked the implementation with o3-pro, especially on the math side of things, everything was good but the agent stated that the following bullets still require your attention:

* **Numeric robustness** – When D approaches 500‑600 m, $\arctan(H/D)$ is only \~2.3°. Your code uses degrees; be sure to do trigonometry in radians and at double precision.
* **Upper‑bound strategy** – If you left `right` at a fixed large value (e.g. 1000 m) that’s fine, but a more elegant approach is to **exponentially expand** the search window until the pixel‑gap test fails—guaranteeing no hard ceiling can be hit in the future.
* **Unit tests** – Add regression tests such as

  ```ts
  expect(computeMaxDistance(25, 10)).toBeGreaterThan(450);
  ```

  to ensure the plateau can’t sneak back in.

Please assess everything necessary, and tell me if we need to fix or improve anything (don't code, just assess).



@PLAN.md I want you to write a proper README so that an AI Agent and a human know how to use this tool. It should be a markdown file easy to read and understand docused in the available cli API and all the supported use cases.



Are ym able to create a new gh repo in the gocleverorg organization in my account (using `gh` terminal commands) and associate this repo to that gh repo?