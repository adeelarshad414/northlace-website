import { handleContactRequest, type FormEnv } from "../_shared/form-handler";

type PagesFunction<Env> = (context: {
  env: Env;
  request: Request;
}) => Response | Promise<Response>;

export const onRequestPost: PagesFunction<FormEnv> = ({ env, request }) =>
  handleContactRequest({ env, request });
