import { FC } from "react";

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { Icon } from "~/components/common/icon/Icon";

import classes from "~/components/ui/repository/Repository.module.scss";

type Props = {
  repository: {
    readme: string;
    name: string;
    description: string;
    codeLanguage: {
      clolr: string;
      language: string;
    };
    githubUrl: string;
  };
};

export const Repository: FC<Props> = ({ repository }) => {
  return (
    <div className={classes.repository}>
      <div className={classes.readme}>
        <div className={classes["readme-back"]}>
          <ReactMarkdown
            className={classes["readme-content"]}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {repository.readme}
          </ReactMarkdown>
        </div>
      </div>
      <a href={repository.githubUrl} target="_blank" rel="noreferrer">
        <div className={classes.description}>
          <div className={classes["repository-name"]}>
            <Icon name="Book" size={44}></Icon>
            <p>{repository.name}</p>
          </div>
          <div className={classes["repository-description"]}>
            <p>{repository.description}</p>
          </div>
          {(repository.codeLanguage.clolr ||
            repository.codeLanguage.language) && (
            <div className={classes["repository-code"]}>
              <div
                className={classes["code-color"]}
                style={{ color: repository.codeLanguage.clolr }}
              >
                ●
              </div>
              <div className={classes["code-language"]}>
                <p>{repository.codeLanguage.language}</p>
              </div>
            </div>
          )}
        </div>
      </a>
    </div>
  );
};
