--
-- PostgreSQL database dump
--

\restrict NJ9rHkcNewY7xomJ16CTeWPfyZ5OOdC088nfXgdO1DwEvXjjcKdezGcxZpokG5n

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: citas; Type: TABLE; Schema: public; Owner: techfix_agenda
--

CREATE TABLE public.citas (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    descripcion character varying(500),
    estado character varying(20) NOT NULL,
    fecha_hora timestamp(6) without time zone NOT NULL,
    tipo_servicio character varying(20) NOT NULL,
    updated_at timestamp(6) without time zone,
    cliente_id bigint NOT NULL,
    tecnico_id bigint,
    CONSTRAINT citas_estado_check CHECK (((estado)::text = ANY ((ARRAY['PENDIENTE'::character varying, 'EN_PROCESO'::character varying, 'COMPLETADA'::character varying, 'CANCELADA'::character varying])::text[]))),
    CONSTRAINT citas_tipo_servicio_check CHECK (((tipo_servicio)::text = ANY ((ARRAY['REPARACION'::character varying, 'INSTALACION'::character varying])::text[])))
);


ALTER TABLE public.citas OWNER TO techfix_agenda;

--
-- Name: citas_id_seq; Type: SEQUENCE; Schema: public; Owner: techfix_agenda
--

CREATE SEQUENCE public.citas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.citas_id_seq OWNER TO techfix_agenda;

--
-- Name: citas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: techfix_agenda
--

ALTER SEQUENCE public.citas_id_seq OWNED BY public.citas.id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: techfix_agenda
--

CREATE TABLE public.clientes (
    id bigint NOT NULL,
    apellido character varying(100) NOT NULL,
    created_at timestamp(6) without time zone,
    email character varying(150),
    nombre character varying(100) NOT NULL,
    telefono character varying(20),
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.clientes OWNER TO techfix_agenda;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: techfix_agenda
--

CREATE SEQUENCE public.clientes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO techfix_agenda;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: techfix_agenda
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: tecnicos; Type: TABLE; Schema: public; Owner: techfix_agenda
--

CREATE TABLE public.tecnicos (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    apellido character varying(100) NOT NULL,
    created_at timestamp(6) without time zone,
    email character varying(150),
    especialidad character varying(100),
    nombre character varying(100) NOT NULL,
    telefono character varying(20),
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.tecnicos OWNER TO techfix_agenda;

--
-- Name: tecnicos_id_seq; Type: SEQUENCE; Schema: public; Owner: techfix_agenda
--

CREATE SEQUENCE public.tecnicos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tecnicos_id_seq OWNER TO techfix_agenda;

--
-- Name: tecnicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: techfix_agenda
--

ALTER SEQUENCE public.tecnicos_id_seq OWNED BY public.tecnicos.id;


--
-- Name: citas id; Type: DEFAULT; Schema: public; Owner: techfix_agenda
--

ALTER TABLE ONLY public.citas ALTER COLUMN id SET DEFAULT nextval('public.citas_id_seq'::regclass);


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: techfix_agenda
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: tecnicos id; Type: DEFAULT; Schema: public; Owner: techfix_agenda
--

ALTER TABLE ONLY public.tecnicos ALTER COLUMN id SET DEFAULT nextval('public.tecnicos_id_seq'::regclass);


--
-- Data for Name: citas; Type: TABLE DATA; Schema: public; Owner: techfix_agenda
--

COPY public.citas (id, created_at, descripcion, estado, fecha_hora, tipo_servicio, updated_at, cliente_id, tecnico_id) FROM stdin;
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: techfix_agenda
--

COPY public.clientes (id, apellido, created_at, email, nombre, telefono, updated_at) FROM stdin;
\.


--
-- Data for Name: tecnicos; Type: TABLE DATA; Schema: public; Owner: techfix_agenda
--

COPY public.tecnicos (id, activo, apellido, created_at, email, especialidad, nombre, telefono, updated_at) FROM stdin;
\.


--
-- Name: citas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: techfix_agenda
--

SELECT pg_catalog.setval('public.citas_id_seq', 1, false);


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: techfix_agenda
--

SELECT pg_catalog.setval('public.clientes_id_seq', 1, false);


--
-- Name: tecnicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: techfix_agenda
--

SELECT pg_catalog.setval('public.tecnicos_id_seq', 1, false);


--
-- Name: citas citas_pkey; Type: CONSTRAINT; Schema: public; Owner: techfix_agenda
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: techfix_agenda
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: tecnicos tecnicos_pkey; Type: CONSTRAINT; Schema: public; Owner: techfix_agenda
--

ALTER TABLE ONLY public.tecnicos
    ADD CONSTRAINT tecnicos_pkey PRIMARY KEY (id);


--
-- Name: clientes uk_1c96wv36rk2hwui7qhjks3mvg; Type: CONSTRAINT; Schema: public; Owner: techfix_agenda
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT uk_1c96wv36rk2hwui7qhjks3mvg UNIQUE (email);


--
-- Name: tecnicos uk_bquon34afupdx4ssovepfeyp6; Type: CONSTRAINT; Schema: public; Owner: techfix_agenda
--

ALTER TABLE ONLY public.tecnicos
    ADD CONSTRAINT uk_bquon34afupdx4ssovepfeyp6 UNIQUE (email);


--
-- Name: citas fke3bl1mspam9t5c4rmg7feyn3o; Type: FK CONSTRAINT; Schema: public; Owner: techfix_agenda
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT fke3bl1mspam9t5c4rmg7feyn3o FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: citas fkp8hsioiui6672rep4ijsepce1; Type: FK CONSTRAINT; Schema: public; Owner: techfix_agenda
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT fkp8hsioiui6672rep4ijsepce1 FOREIGN KEY (tecnico_id) REFERENCES public.tecnicos(id);


--
-- PostgreSQL database dump complete
--

\unrestrict NJ9rHkcNewY7xomJ16CTeWPfyZ5OOdC088nfXgdO1DwEvXjjcKdezGcxZpokG5n

