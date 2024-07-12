import * as React from 'react';

import { Layouts, Page, useFetchClient } from '@strapi/admin/strapi-admin';
import { Button, Flex, LinkButton, Main, Typography } from '@strapi/design-system';
import { CheckCircle } from '@strapi/icons';
import { CodeSquare, PlaySquare, GlassesSquare } from '@strapi/icons/symbols';
import { useIntl } from 'react-intl';
import { Link, NavLink } from 'react-router-dom';

import { ContentBox } from '../components/ContentBox';
import { DeployButton } from '../components/DeployButton';
import { getTranslation } from '../utils/getTranslation';

interface Project {
  createdAt: Date;
  displayName: string;
  environments: { [key: string]: Environment };
  hasGitSource: boolean;
  isMaintainer: boolean;
  name: string;
  ownerId: string;
  region: string;
  repository: any;
  stats: { daysLeftInTria: number };
  suspendedAt: Date | null;
  suspendedReasons: [];
  updatedAt: Date;
}
interface ProjectDetails extends Project {
  environments: { [key: string]: EnvironmentDetails };
  hasGitSource: boolean;
  isTrial: boolean;
}

interface Environment {
  branch: string;
  failedChecks: [];
  hasLiveDeployment: boolean;
  id: string;
  isProduction: boolean;
  url: string;
}

interface EnvironmentDetails extends Environment {
  internalName: string;
}

const MarketingPresentation = () => {
  const { formatMessage } = useIntl();

  return (
    <Flex direction="row" gap={4} alignItems="flex-start">
      <Flex width="65%" gap={4} direction="column" alignItems="stretch">
        <ContentBox
          title={formatMessage({
            id: getTranslation('pages.home.features.tools-title'),
            defaultMessage: 'Get Everything You Need to Run Strapi in Production',
          })}
          subtitle={formatMessage({
            id: getTranslation('pages.home.features.tools-description'),
            defaultMessage:
              'Get a database, email provider, and CDN without having to manage it all yourself.',
          })}
          icon={<CodeSquare />}
          iconBackground="warning100"
        />
        <ContentBox
          title={formatMessage({
            id: getTranslation('pages.home.features.deploy-title'),
            defaultMessage: 'Deploy Strapi to Production in Just a Few Clicks',
          })}
          subtitle={formatMessage({
            id: getTranslation('pages.home.features.deploy-description'),
            defaultMessage:
              'Connect your repository, choose your region, and get started with generous usage limits.',
          })}
          icon={<PlaySquare />}
          iconBackground="secondary100"
        />
        <ContentBox
          title={formatMessage({
            id: getTranslation('pages.home.features.control-title'),
            defaultMessage: 'Remain in Complete Control',
          })}
          subtitle={formatMessage({
            id: getTranslation('pages.home.features.control-description'),
            defaultMessage: 'No lock-in. You remain in control of your stack and the tools you use',
          })}
          icon={<GlassesSquare />}
          iconBackground="alternative100"
        />
      </Flex>
      <Flex
        direction="column"
        alignItems="stretch"
        background="neutral0"
        shadow="tableShadow"
        flex={1}
        padding={4}
        gap={6}
        hasRadius
      >
        <Flex direction="row" justifyContent="space-between">
          <Flex direction="column" gap={1} alignItems="flex-start">
            <Typography variant="omega" fontWeight="bold">
              Developer plan
            </Typography>
            <Typography variant="pi" textColor="neutral600">
              Best suited for <b>small projects</b>
            </Typography>
          </Flex>
          <p>
            <Typography variant="beta">USD 29</Typography>
            <Typography variant="pi">/month</Typography>
          </p>
        </Flex>
        <Flex direction="column" gap={3} alignItems="flex-start">
          {[
            '10 CMS seats',
            '1 admin user',
            '1GB of database storage',
            '150GB of assets storage',
            '500 GB of assets bandwidth',
          ].map((feature, index) => (
            <Flex direction="row" gap={2} key={index}>
              <CheckCircle fill="success600" />
              <Typography variant="omega">{feature}</Typography>
            </Flex>
          ))}
        </Flex>
        <Flex direction="row" gap={3}>
          <Button>Start free trial</Button>
          <LinkButton variant="secondary" tag={Link} to="https://strapi.io/pricing-cloud">
            View pricing plans
          </LinkButton>
        </Flex>
      </Flex>
    </Flex>
  );
};

const Home = () => {
  const { formatMessage } = useIntl();
  const [projects, setProjects] = React.useState([] as Project[]);
  const [projectInternalName, setProjectInternalName] = React.useState('' as string);
  // TODO: hook to api calls
  const isLoading = false;
  const isError = false;
  const dashboardUrl = 'https://cloud.strapi.io';

  const { get, post } = useFetchClient();

  async function deploy() {
    // eslint-disable-next-line no-console
    console.log(`Deploying ${projectInternalName}...`);
    const { data } = await post('/cloud/deploy', {
      project: projectInternalName,
    });
    // eslint-disable-next-line no-console
    console.log(data);
  }

  React.useEffect(() => {
    const fetch = async () => {
      const { data } = await get('/cloud/me');
      // eslint-disable-next-line no-console
      console.log(data);
    };

    fetch();
  }, [get]);

  React.useEffect(() => {
    const fetchUserProjects = async () => {
      const { data }: { data: { data: Project[] } } = await get('/cloud/projects');
      setProjects(data.data);
    };

    fetchUserProjects();
  }, [get]);

  React.useEffect(() => {
    const fetchProject = async () => {
      const projectName = projects[0].name;

      const { data }: { data: { data: ProjectDetails } } = await get(
        `/cloud/projects/${projectName}`
      );

      setProjectInternalName(data.data.environments.production.internalName);
    };

    if (projects.length > 0) {
      fetchProject();
    }
  }, [get, projects]);

  if (isLoading) {
    return <Page.Loading />;
  }

  if (isError) {
    return <Page.Error />;
  }

  return (
    <Main aria-busy={isLoading}>
      <Layouts.Header
        title={formatMessage({
          id: getTranslation('pages.home.title'),
          defaultMessage: 'Strapi Cloud',
        })}
        subtitle={formatMessage({
          id: getTranslation('pages.home.subtitle'),
          defaultMessage: 'Manage your app deployments',
        })}
        primaryAction={
          <LinkButton tag={NavLink} to={dashboardUrl}>
            {formatMessage({ id: getTranslation('pages.home.open-dashboard') })}
          </LinkButton>
        }
      />
      <Layouts.Content>
        <MarketingPresentation />
        <DeployButton onClick={deploy} disabled={projectInternalName === ''} />
      </Layouts.Content>
    </Main>
  );
};

export { Home };