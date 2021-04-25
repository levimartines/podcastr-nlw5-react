import React from 'react';
import Image from 'next/image';
import { GetStaticPaths, GetStaticProps } from 'next';
import { api } from '../../services/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import Link from 'next/link';
import { usePlayer } from '../../contexts/PlayerContext';
import Head from 'next/head';

type EpisodeProps = {
  episode: Episode;
}

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  publishedAt: string;
  url: string;
  description: string;
}

export default function Episode({ episode }: EpisodeProps) {
  const {
    play
  } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>
      <div className={styles.thumbnailContainer}>

        <Link href={'/'}>
          <button type='button'>
            <img src="/arrow-left.svg" alt="Voltar"/>
          </button>
        </Link>


        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit='cover'
        />

        <button type='button' onClick={() => play(episode)}>
          <img src="/play.svg" alt="Reproduzir episódio"/>
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>

        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: episode.description }}
        />
      </header>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api('episodes', {
    params: {
      _limit: '2',
      _sort: 'published_at',
      _order: 'desc'
    }
  });
  const paths = data.map(episode => {
    return {
      params: { slug: episode.id }
    };
  });
  return {
    paths,
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params;
  const { data } = await api(`episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url
  };
  return {
    props: {
      episode
    },
    revalidate: 60 * 60 * 24
  };
};