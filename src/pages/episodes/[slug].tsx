import { format, parseISO } from 'date-fns'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../../services/api'
import { usePlayer } from '../../contexts/PlayerContext'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'
import ptBR from 'date-fns/locale/pt-BR'
import Image from 'next/image'
import { BsHeart } from 'react-icons/bs'

import styles from './episode.module.scss'

interface IEpisode {
    id: string
    title: string
    members: string
    publishedAt: string
    thumbnail: string
    url: string
    duration: number
    durationAsString: number
    description: string
}

interface IEpisodeProps {
    episode: IEpisode
}

export default function Episode({ episode }: IEpisodeProps) {
    const { play } = usePlayer()

    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>
            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>

                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                    loading="eager"
                />

                <button>
                    <img
                        src="/play.svg"
                        onClick={() => play(episode)}
                        alt="Tocar o episódio"
                    />
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
                <span>
                    <BsHeart />
                </span>
            </header>

            <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: episode.description }}
            />
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('episodes', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc',
        },
    })

    const paths = data.map((episode) => {
        return {
            params: {
                slug: episode.id,
            },
        }
    })

    return {
        paths,
        fallback: 'blocking',
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params

    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,

        publishedAt: format(parseISO(data.published_at), 'd MMM yy ', {
            locale: ptBR,
        }),

        duration: Number(data.file.duration),

        durationAsString: convertDurationToTimeString(
            Number(data.file.duration)
        ),

        description: data.description,
        url: data.file.url,
    }

    return {
        props: { episode },
        revalidate: 60 * 60 * 24, //24hours
    }
}
