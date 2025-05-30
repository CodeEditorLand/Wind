import { Effect, Option, pipe } from "../../../effect";
import { PathProblem } from "../Errors.js";
import { FetchDocumentDirectory, FetchHomeDirectory } from "../Wrappers.js";
const Resolve = pipe(
  FetchHomeDirectory,
  Effect.map(Option.some),
  Effect.catchTag(
    "PathProblem",
    (ErrorDetails) => ErrorDetails.operation === "homeDir" ? pipe(
      FetchDocumentDirectory,
      Effect.map(Option.some),
      Effect.catchTag(
        "PathProblem",
        (ErrorDetailsDoc) => ErrorDetailsDoc.operation === "documentDir" ? Effect.succeed(Option.none()) : Effect.fail(ErrorDetailsDoc)
      )
    ) : Effect.fail(ErrorDetails)
  )
);
var FallbackDefaultPath_default = Resolve;
export {
  FallbackDefaultPath_default as default
};
//# sourceMappingURL=FallbackDefaultPath.js.map
