--
-- PostgreSQL database dump
--

\restrict OTztArdMdqyIC4ZanheUeqaxO4d8I5Kv6NG5IMNR8mzRHX1bRYvGvIH0cXbYQOO

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
-- Name: categories; Type: TABLE; Schema: public; Owner: techfix_stock
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    active boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    name character varying(100) NOT NULL,
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.categories OWNER TO techfix_stock;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: techfix_stock
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO techfix_stock;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: techfix_stock
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: techfix_stock
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    barcode character varying(100),
    brand character varying(100),
    cost_price numeric(12,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    image_url character varying(500),
    location character varying(100),
    max_stock_level integer,
    min_stock_level integer NOT NULL,
    model character varying(100),
    name character varying(255) NOT NULL,
    notes text,
    quantity_in_stock integer NOT NULL,
    sale_price numeric(12,2) NOT NULL,
    sku character varying(100) NOT NULL,
    status character varying(20) NOT NULL,
    updated_at timestamp(6) without time zone,
    category_id bigint,
    CONSTRAINT products_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'DISCONTINUED'::character varying])::text[])))
);


ALTER TABLE public.products OWNER TO techfix_stock;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: techfix_stock
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO techfix_stock;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: techfix_stock
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: techfix_stock
--

CREATE TABLE public.stock_movements (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(100),
    movement_type character varying(20) NOT NULL,
    notes text,
    quantity integer NOT NULL,
    quantity_after integer NOT NULL,
    quantity_before integer NOT NULL,
    reference character varying(200),
    unit_cost numeric(12,2),
    product_id bigint NOT NULL,
    CONSTRAINT stock_movements_movement_type_check CHECK (((movement_type)::text = ANY ((ARRAY['PURCHASE'::character varying, 'SALE'::character varying, 'ADJUSTMENT'::character varying, 'RETURN'::character varying, 'TRANSFER'::character varying, 'DAMAGE'::character varying])::text[])))
);


ALTER TABLE public.stock_movements OWNER TO techfix_stock;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: techfix_stock
--

CREATE SEQUENCE public.stock_movements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO techfix_stock;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: techfix_stock
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: techfix_stock
--

COPY public.categories (id, active, created_at, description, name, updated_at) FROM stdin;
1	t	2026-05-20 17:23:05.081263	Repuestos para dispositivos móviles y smartphones	Smartphones	2026-05-20 17:23:05.081263
2	t	2026-05-20 17:23:05.081263	Piezas y componentes para armar o reparar PCs	Componentes PC	2026-05-20 17:23:05.081263
3	t	2026-05-20 17:23:05.081263	Accesorios varios	Accesorios	2026-05-20 17:23:05.081263
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: techfix_stock
--

COPY public.products (id, barcode, brand, cost_price, created_at, description, image_url, location, max_stock_level, min_stock_level, model, name, notes, quantity_in_stock, sale_price, sku, status, updated_at, category_id) FROM stdin;
1	123456789001	Samsung	15000.00	2026-05-20 17:23:05.127946	Batería de repuesto original de 5000 mAh para Samsung Galaxy A54 5G.	/imgrepuestos/bateriasamsunga54.png	Estante A1	100	5	A54 5G	Batería Original Samsung Galaxy A54	Requiere instalación profesional.	50	35000.00	BAT-SAM-A54	ACTIVE	2026-05-20 17:23:05.127946	1
2	123456789002	Apple	45000.00	2026-05-20 17:23:05.127946	Pantalla Super Retina XDR OLED de 6.1 pulgadas de repuesto para iPhone 13.	/imgrepuestos/pantallaiphone13.jpg	Estante A2	30	3	iPhone 13	Pantalla OLED iPhone 13	Compatible solo con modelo estándar.	15	120000.00	PANT-IPH-13	ACTIVE	2026-05-20 17:23:05.127946	1
3	123456789003	Kingston	22000.00	2026-05-20 17:23:05.127946	Módulo de memoria RAM Kingston Fury Beast DDR4 de 16GB a 3200MHz.	/imgrepuestos/ramddr416gb3200mhzkingston.jpg	Estante B1	80	5	Fury Beast	Memoria RAM DDR4 16GB 3200MHz Kingston Fury Beast	Garantía de por vida.	30	48000.00	RAM-DDR4-16GB-3200	ACTIVE	2026-05-20 17:23:05.127946	2
4	123456789004	Noctua	35000.00	2026-05-20 17:23:05.127946	Disipador de CPU de alto rendimiento Noctua NH-U12S con ventilador NF-F12 de 120mm.	/imgrepuestos/coolercpunoctuanh-u12s.jpg	Estante B2	25	2	NH-U12S	Cooler CPU Noctua NH-U12S	Incluye pasta térmica NT-H1.	10	75000.00	COOL-NOCT-NHU12S	ACTIVE	2026-05-20 17:23:05.127946	2
5	123456789005	NVIDIA	250000.00	2026-05-20 17:23:05.127946	Tarjeta de video NVIDIA GeForce RTX 3060 de 12GB GDDR6.	/imgrepuestos/rtx3060.jpg	Vitrina C1	15	2	RTX 3060	Tarjeta Gráfica GeForce RTX 3060 12GB	Ideal para gaming a 1080p.	8	360000.00	GPU-RTX-3060	ACTIVE	2026-05-20 17:23:05.127946	2
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: techfix_stock
--

COPY public.stock_movements (id, created_at, created_by, movement_type, notes, quantity, quantity_after, quantity_before, reference, unit_cost, product_id) FROM stdin;
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: techfix_stock
--

SELECT pg_catalog.setval('public.categories_id_seq', 3, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: techfix_stock
--

SELECT pg_catalog.setval('public.products_id_seq', 5, true);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: techfix_stock
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 1, false);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: products uk_fhmd06dsmj6k0n90swsh8ie9g; Type: CONSTRAINT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT uk_fhmd06dsmj6k0n90swsh8ie9g UNIQUE (sku);


--
-- Name: products uk_qfr8vf85k3q1xinifvsl1eynf; Type: CONSTRAINT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT uk_qfr8vf85k3q1xinifvsl1eynf UNIQUE (barcode);


--
-- Name: categories uk_t8o6pivur7nn124jehx7cygw5; Type: CONSTRAINT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT uk_t8o6pivur7nn124jehx7cygw5 UNIQUE (name);


--
-- Name: ix_movements_created; Type: INDEX; Schema: public; Owner: techfix_stock
--

CREATE INDEX ix_movements_created ON public.stock_movements USING btree (created_at);


--
-- Name: ix_movements_product; Type: INDEX; Schema: public; Owner: techfix_stock
--

CREATE INDEX ix_movements_product ON public.stock_movements USING btree (product_id);


--
-- Name: ix_movements_type; Type: INDEX; Schema: public; Owner: techfix_stock
--

CREATE INDEX ix_movements_type ON public.stock_movements USING btree (movement_type);


--
-- Name: ix_products_category; Type: INDEX; Schema: public; Owner: techfix_stock
--

CREATE INDEX ix_products_category ON public.products USING btree (category_id);


--
-- Name: ix_products_sku; Type: INDEX; Schema: public; Owner: techfix_stock
--

CREATE INDEX ix_products_sku ON public.products USING btree (sku);


--
-- Name: ix_products_status; Type: INDEX; Schema: public; Owner: techfix_stock
--

CREATE INDEX ix_products_status ON public.products USING btree (status);


--
-- Name: stock_movements fkjcaag8ogfjxpwmqypi1wfdaog; Type: FK CONSTRAINT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT fkjcaag8ogfjxpwmqypi1wfdaog FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: products fkog2rp4qthbtt2lfyhfo32lsw9; Type: FK CONSTRAINT; Schema: public; Owner: techfix_stock
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fkog2rp4qthbtt2lfyhfo32lsw9 FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- PostgreSQL database dump complete
--

\unrestrict OTztArdMdqyIC4ZanheUeqaxO4d8I5Kv6NG5IMNR8mzRHX1bRYvGvIH0cXbYQOO

