import { Button, Grid, GridItem, Flex, IconButton, Text, Menu, MenuButton, MenuDivider, MenuItem, MenuList, useDisclosure, Box, Heading, Input, Select, Textarea } from '@chakra-ui/react'
import { AddIcon, ChevronDownIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import React from 'react'
import moment from 'moment'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BiLink } from 'react-icons/bi'
import { useEffect } from 'react'
import { useState } from 'react'
import Card from 'components/card/Card'
import { IoIosArrowBack } from "react-icons/io";
import { HasAccess } from '../../../redux/accessUtils';
import { HSeparator } from 'components/separator/Separator';
import AddEdit from './AddEdit';
import CommonDeleteModel from 'components/commonDeleteModel';
import { deleteManyApi, putApi, getApi } from '../../../services/api';
import { FaFilePdf } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import { opprtunitiesSchema } from '../../../schema/opprtunitiesSchema';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { quoteSchema } from '../../../schema/quoteSchema';

const View = (props) => {
    const params = useParams()
    const { id } = params
    const user = JSON.parse(localStorage.getItem("user"))

    const [permission, contactAccess, leadAccess] = HasAccess(['Tasks', 'Contacts', 'Leads'])

    const [data, setData] = useState()
    const { onOpen, onClose } = useDisclosure()
    const [edit, setEdit] = useState(false);
    const [deleteModel, setDelete] = useState(false);
    const [deleteManyModel, setDeleteManyModel] = useState(false);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [type, setType] = useState("")
    const [editableField, setEditableField] = useState(null);
    const [editableFieldName, setEditableFieldName] = useState(null);
    const today = new Date().toISOString().split('T')[0];
    const todayTime = new Date().toISOString().split('.')[0];

    const fetchViewData = async () => {
        if (id) {
            let result = await getApi('api/quotes/view/', id);
            setData(result?.data);
        }
    }
    const generatePDF = () => {
        setLoading(true)
        const element = document.getElementById("reports");
        const hideBtn = document.getElementById("hide-btn");

        if (element) {
            hideBtn.style.display = 'none';
            html2pdf()
                .from(element)
                .set({
                    margin: [0, 0, 0, 0],
                    filename: `Quotes_Details_${moment().format("DD-MM-YYYY")}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, allowTaint: true },
                    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
                })
                .save().then(() => {
                    setLoading(false)
                    hideBtn.style.display = '';
                })
            // }, 500);
        } else {
            console.error("Element with ID 'reports' not found.");
            setLoading(false)
        }
    };
    const handleDeleteAccount = async (ids) => {
        try {
            let response = await deleteManyApi('api/quotes/deleteMany', ids)
            if (response.status === 200) {
                navigate('/quotes')
                toast.success(`Quotes Delete successfully`)
                setDeleteManyModel(false)
            }
        } catch (error) {
            console.log(error)
            toast.error(`server error`)

        }

    }

    const initialValues = {
        title: data?.title,
        oppotunity: data?.oppotunity,
        quoteStage: data?.quoteStage,
        invoiceStatus: data?.invoiceStatus,
        validUntile: data?.validUntile,
        assignedTo: data?.assignedTo,
        paymentTerms: data?.paymentTerms,
        approvalStatus: data?.approvalStatus,
        nonPrimaryEmail: data?.nonPrimaryEmail,
        approvalIssues: data?.approvalIssues,
        terms: data?.terms,
        description: data?.description,
        account: data?.account,
        contact: data?.contact,
        billingStreet: data?.billingStreet,
        shippingStreet: data?.shippingStreet,
        billingCity: data?.billingCity,
        shippingCity: data?.shippingCity,
        billingState: data?.billingState,
        shippingState: data?.shippingState,
        billingPostalCode: data?.billingPostalCode,
        shippingPostalCode: data?.shippingPostalCode,
        billingCountry: data?.billingCountry,
        shippingCountry: data?.shippingCountry,
        isCheck: data?.isCheck,
        currency: data?.currency,
        total: data?.total,
        discount: data?.discount,
        subtotal: data?.subtotal,
        shipping: data?.shipping,
        shippingTax: data?.shippingTax,
        ptax: data?.ptax,
        tax: data?.tax,
        grandTotal: data?.grandTotal,
        modifiedBy: JSON.parse(localStorage.getItem('user'))._id
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: quoteSchema,
        enableReinitialize: true,
        onSubmit: async (values, { resetForm }) => {
            const payload = {
                ...values,
                modifiedDate: new Date()
            }
            let response = await putApi(`api/quotes/edit/${id}`, payload)
            if (response.status === 200) {
                setEditableField(null);
                fetchViewData()
                toast.success(`${editableFieldName} Update successfully`)
            } else {
                toast.error(`${editableFieldName} not Update`)
            }
        },
    });
    const handleDoubleClick = (fieldName, value, name) => {
        formik.setFieldValue(fieldName, value);
        setEditableField(fieldName)
        setEditableFieldName(name)
    };

    const handleBlur = (e) => {
        formik.handleSubmit();
    };
    useEffect(() => {
        fetchViewData()
    }, [id, edit])

    return (
        <div>
            <Grid templateColumns="repeat(4, 1fr)" gap={3} id="reports">
                <GridItem colSpan={{ base: 4 }}>
                    <Card >
                        <Grid gap={4}>
                            <GridItem colSpan={2}>
                                <Box>
                                    <Box display={"flex"} justifyContent={"space-between"} >
                                        <Heading size="md" mb={3}>
                                            Quotes Details
                                        </Heading>
                                        <Flex id="hide-btn" >
                                            <Menu>
                                                {(user.role === 'superAdmin' || permission?.create || permission?.update || permission?.delete) && <MenuButton variant="outline" colorScheme='blackAlpha' size="sm" va mr={2.5} as={Button} rightIcon={<ChevronDownIcon />}>
                                                    Actions
                                                </MenuButton>}
                                                <MenuDivider />
                                                <MenuList minWidth={2}>
                                                    {(user.role === 'superAdmin' || permission?.create) && <MenuItem onClick={() => { setEdit(true); setType("add"); formik.resetForm() }
                                                    } alignItems={'start'} color={'blue'} icon={<AddIcon />}>Add</MenuItem>}
                                                    {(user.role === 'superAdmin' || permission?.update) && <MenuItem onClick={() => { setEdit(true); setType("edit") }} alignItems={'start'} icon={<EditIcon />}>Edit</MenuItem>}
                                                    <MenuItem onClick={generatePDF} alignItems={"start"} icon={<FaFilePdf />} display={"flex"} style={{ alignItems: "center" }}>Print as PDF</MenuItem >

                                                    {(user.role === 'superAdmin' || permission?.deleteModel) && <>
                                                        <MenuDivider />
                                                        <MenuItem alignItems={'start'} onClick={() => setDeleteManyModel(true)} color={'red'} icon={<DeleteIcon />}>Delete</MenuItem>
                                                    </>}
                                                </MenuList>
                                            </Menu>
                                            <Button leftIcon={<IoIosArrowBack />} size='sm' variant="brand" onClick={() => navigate(-1)} >
                                                Back
                                            </Button>
                                        </Flex>
                                    </Box>
                                    <HSeparator />
                                </Box>
                            </GridItem>

                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Title </Text>
                                {
                                    editableField === "title" ?
                                        <>
                                            <Input
                                                id="text"
                                                name="title"
                                                type="text"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.title}
                                                borderColor={formik?.errors?.title && formik?.touched?.title ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.title && formik?.touched.title && formik?.errors.title}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("title", data?.title, "Title")}>{data?.title ? data?.title : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Opportunity</Text>
                                {
                                    data?.oppotunity ?
                                        <Link to={`/accountView/${data?.oppotunity}`}>
                                            <Text color={contactAccess?.view ? 'blue.500' : 'blackAlpha.900'} sx={{ '&:hover': { color: contactAccess?.view ? 'blue.500' : 'blackAlpha.900', textDecoration: contactAccess?.view ? 'underline' : 'none' } }} style={{ cursor: "pointer" }}>{data?.oppotunityName ? data?.oppotunityName : ' - '}</Text>
                                        </Link>
                                        :
                                        <Text color={contactAccess?.view ? 'blue.500' : 'blackAlpha.900'} sx={{ '&:hover': { color: contactAccess?.view ? 'blue.500' : 'blackAlpha.900', textDecoration: contactAccess?.view ? 'underline' : 'none' } }}>{data?.oppotunityName ? data?.oppotunityName : ' - '}</Text>

                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Quote Stage </Text>
                                {
                                    editableField === "quoteStage" ?
                                        <>
                                            <Select
                                                value={formik?.values.quoteStage}
                                                name="quoteStage"
                                                onChange={formik?.handleChange}
                                                onBlur={handleBlur}
                                                mb={formik?.errors.quoteStage && formik?.touched.quoteStage ? undefined : '10px'}
                                                fontWeight='500'
                                                placeholder={'Quote Stage'}
                                                borderColor={formik?.errors.quoteStage && formik?.touched.quoteStage ? "red.300" : null}
                                            >
                                                <option value="Draft" >Draft</option>
                                                <option value="Negotiation" >Negotiation</option>
                                                <option value="Delivered" >Delivered</option>
                                                <option value="On Hold" >On Hold</option>
                                                <option value="Confirmed" >Confirmed</option>
                                                <option value="Closed Accepted" >Closed Accepted</option>
                                                <option value="Closed Lost" >Closed Lost</option>
                                                <option value="Closed Dead" >Closed Dead</option>
                                            </Select>
                                            <Text mb='10px' color={'red'}> {formik?.errors.quoteStage && formik?.touched.quoteStage && formik?.errors.quoteStage}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("quoteStage", data?.quoteStage, "Quote Stage")}>{data?.quoteStage ? data?.quoteStage : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Invoice Status </Text>
                                {
                                    editableField === "invoiceStatus" ?
                                        <>
                                            <Select
                                                value={formik?.values.invoiceStatus}
                                                name="invoiceStatus"
                                                onChange={formik?.handleChange}
                                                onBlur={handleBlur}
                                                mb={formik?.errors.invoiceStatus && formik?.touched.invoiceStatus ? undefined : '10px'}
                                                fontWeight='500'
                                                placeholder={'Invoice Status'}
                                                borderColor={formik?.errors.invoiceStatus && formik?.touched.invoiceStatus ? "red.300" : null}
                                            >
                                                <option value="Not Invoiced">Not Invoiced</option>
                                                <option value="Invoiced">Invoiced</option>
                                            </Select>
                                            <Text mb='10px' color={'red'}> {formik?.errors.invoiceStatus && formik?.touched.invoiceStatus && formik?.errors.invoiceStatus}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("invoiceStatus", data?.invoiceStatus, "Invoice Status")}>{data?.invoiceStatus ? data?.invoiceStatus : ' - '}</Text>
                                }
                            </GridItem>

                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Valid Untile</Text>
                                {
                                    editableField === "validUntile" ?
                                        <>
                                            <Input
                                                name="validUntile"
                                                type="date"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={dayjs(formik.values.validUntile).format("YYYY-MM-DD")}
                                                borderColor={formik?.errors?.validUntile && formik?.touched?.validUntile ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.validUntile && formik?.touched.validUntile && formik?.errors.validUntile}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("validUntile", data?.validUntile, "Valid Untile")}>{data?.validUntile ? data?.validUntile : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Payment Terms</Text>
                                {
                                    editableField === "paymentTerms" ?
                                        <>
                                            <Select
                                                value={formik?.values.paymentTerms}
                                                name="paymentTerms"
                                                onChange={formik?.handleChange}
                                                onBlur={handleBlur}
                                                mb={formik?.errors.paymentTerms && formik?.touched.paymentTerms ? undefined : '10px'}
                                                fontWeight='500'
                                                placeholder={'Payment Terms'}
                                                borderColor={formik?.errors.paymentTerms && formik?.touched.paymentTerms ? "red.300" : null}
                                            >
                                                <option value="Nett 15" >Nett 15</option>
                                                <option value="Nett 30" >Nett 30</option>
                                            </Select>
                                            <Text mb='10px' color={'red'}> {formik?.errors.paymentTerms && formik?.touched.paymentTerms && formik?.errors.paymentTerms}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("paymentTerms", data?.paymentTerms, "Payment Terms")}>{data?.paymentTerms ? data?.paymentTerms : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Approval Status</Text>
                                {
                                    editableField === "approvalStatus" ?
                                        <>
                                            <Select
                                                value={formik?.values.approvalStatus}
                                                name="approvalStatus"
                                                onChange={formik?.handleChange}
                                                onBlur={handleBlur}
                                                mb={formik?.errors.approvalStatus && formik?.touched.approvalStatus ? undefined : '10px'}
                                                fontWeight='500'
                                                placeholder={'Approval Status'}
                                                borderColor={formik?.errors.approvalStatus && formik?.touched.approvalStatus ? "red.300" : null}
                                            >
                                                <option value="Approved">Approved</option>
                                            </Select>
                                            <Text mb='10px' color={'red'}> {formik?.errors.approvalStatus && formik?.touched.approvalStatus && formik?.errors.approvalStatus}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("approvalStatus", data?.approvalStatus, "Approval Status")}>{data?.approvalStatus ? data?.approvalStatus : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Approval Issues</Text>
                                {
                                    editableField === "approvalIssues" ?
                                        <>
                                            <Textarea
                                                fontSize='sm'
                                                value={formik?.values.approvalIssues}
                                                name="approvalIssues"
                                                resize={"none"}
                                                onBlur={handleBlur}
                                                onChange={formik?.handleChange}
                                                placeholder='Approval Issues'
                                                fontWeight='500'
                                                borderColor={formik?.errors.approvalIssues && formik?.touched.approvalIssues ? "red.300" : null}
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.approvalIssues && formik?.touched.approvalIssues && formik?.errors.approvalIssues}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("approvalIssues", data?.approvalIssues, "Approval Issues")} style={{ width: "300px" }}>{data?.approvalIssues ? data?.approvalIssues : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Terms</Text>
                                {
                                    editableField === "terms" ?
                                        <>
                                            <Textarea
                                                fontSize='sm'
                                                value={formik?.values.terms}
                                                name="terms"
                                                resize={"none"}
                                                onBlur={handleBlur}
                                                onChange={formik?.handleChange}
                                                placeholder='Terms'
                                                fontWeight='500'
                                                borderColor={formik?.errors.terms && formik?.touched.terms ? "red.300" : null}
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.terms && formik?.touched.terms && formik?.errors.terms}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("terms", data?.terms, "Terms")} style={{ width: "300px" }}>{data?.terms ? data?.terms : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Description</Text>
                                {
                                    editableField === "description" ?
                                        <>
                                            <Textarea
                                                fontSize='sm'
                                                value={formik?.values.description}
                                                name="description"
                                                resize={"none"}
                                                onBlur={handleBlur}
                                                onChange={formik?.handleChange}
                                                placeholder='Description'
                                                fontWeight='500'
                                                borderColor={formik?.errors.description && formik?.touched.description ? "red.300" : null}
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.description && formik?.touched.description && formik?.errors.description}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("description", data?.description, "Description")} style={{ width: "300px" }}>{data?.description ? data?.description : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Billing Street</Text>
                                {
                                    editableField === "billingStreet" ?
                                        <>
                                            <Input
                                                name="billingStreet"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.billingStreet}
                                                borderColor={formik?.errors?.billingStreet && formik?.touched?.billingStreet ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.billingStreet && formik?.touched.billingStreet && formik?.errors.billingStreet}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("billingStreet", data?.billingStreet, "Billing Street")}>{data?.billingStreet ? data?.billingStreet : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Shipping Street</Text>
                                {
                                    editableField === "shippingStreet" ?
                                        <>
                                            <Input
                                                name="shippingStreet"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.shippingStreet}
                                                borderColor={formik?.errors?.shippingStreet && formik?.touched?.shippingStreet ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.shippingStreet && formik?.touched.shippingStreet && formik?.errors.shippingStreet}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("shippingStreet", data?.shippingStreet, "Shipping Street")}>{data?.shippingStreet ? data?.shippingStreet : ' - '}</Text>
                                }
                            </GridItem>

                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Billing City
                                </Text>
                                {
                                    editableField === "billingCity" ?
                                        <>
                                            <Input
                                                name="billingCity"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.billingCity}
                                                borderColor={formik?.errors?.billingCity && formik?.touched?.billingCity ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.billingCity && formik?.touched.billingCity && formik?.errors.billingCity}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("billingCity", data?.billingCity, "Billing City")}>{data?.billingCity ? data?.billingCity : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Shipping City
                                </Text>
                                {
                                    editableField === "shippingCity" ?
                                        <>
                                            <Input
                                                name="shippingCity"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.shippingCity}
                                                borderColor={formik?.errors?.shippingCity && formik?.touched?.shippingCity ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.shippingCity && formik?.touched.shippingCity && formik?.errors.shippingCity}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("shippingCity", data?.shippingCity, "Shipping City")}>{data?.shippingCity ? data?.shippingCity : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Billing State</Text>
                                {
                                    editableField === "billingState" ?
                                        <>
                                            <Input
                                                name="billingState"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.billingState}
                                                borderColor={formik?.errors?.billingState && formik?.touched?.billingState ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.billingState && formik?.touched.billingState && formik?.errors.billingState}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("billingState", data?.billingState, "Billing State")}>{data?.billingState ? data?.billingState : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Shipping State</Text>
                                {
                                    editableField === "shippingState" ?
                                        <>
                                            <Input
                                                name="shippingState"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.shippingState}
                                                borderColor={formik?.errors?.shippingState && formik?.touched?.shippingState ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.shippingState && formik?.touched.shippingState && formik?.errors.shippingState}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("shippingState", data?.shippingState, "Shipping State")}>{data?.shippingState ? data?.shippingState : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Billing Postal Code</Text>
                                {
                                    editableField === "billingPostalCode" ?
                                        <>
                                            <Input
                                                name="billingPostalCode"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.billingPostalCode}
                                                borderColor={formik?.errors?.billingPostalCode && formik?.touched?.billingPostalCode ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.billingPostalCode && formik?.touched.billingPostalCode && formik?.errors.billingPostalCode}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("billingPostalCode", data?.billingPostalCode, "Billing Postal Code")}>{data?.billingPostalCode ? data?.billingPostalCode : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Shipping Postal Code</Text>
                                {
                                    editableField === "shippingPostalCode" ?
                                        <>
                                            <Input
                                                name="shippingPostalCode"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.shippingPostalCode}
                                                borderColor={formik?.errors?.shippingPostalCode && formik?.touched?.shippingPostalCode ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.shippingPostalCode && formik?.touched.shippingPostalCode && formik?.errors.shippingPostalCode}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("shippingPostalCode", data?.shippingPostalCode, "Shipping Postal Code")}>{data?.shippingPostalCode ? data?.shippingPostalCode : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Billing Country</Text>
                                {
                                    editableField === "billingCountry" ?
                                        <>
                                            <Input
                                                name="billingCountry"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.billingCountry}
                                                borderColor={formik?.errors?.billingCountry && formik?.touched?.billingCountry ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.billingCountry && formik?.touched.billingCountry && formik?.errors.billingCountry}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("billingCountry", data?.billingCountry, "Billing Country")}>{data?.billingCountry ? data?.billingCountry : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Shipping Country</Text>
                                {
                                    editableField === "shippingCountry" ?
                                        <>
                                            <Input
                                                name="shippingCountry"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.shippingCountry}
                                                borderColor={formik?.errors?.shippingCountry && formik?.touched?.shippingCountry ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.shippingCountry && formik?.touched.shippingCountry && formik?.errors.shippingCountry}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("shippingCountry", data?.shippingCountry, "Shipping Country")}>{data?.shippingCountry ? data?.shippingCountry : ' - '}</Text>
                                }
                            </GridItem>

                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Currency</Text>
                                {
                                    editableField === "currency" ?
                                        <>
                                            <Select
                                                value={formik?.values.currency}
                                                name="currency"
                                                onChange={formik?.handleChange}
                                                onBlur={handleBlur}
                                                fontWeight='500'
                                                placeholder={'Select Currency'}
                                                borderColor={formik?.errors.currency && formik?.touched.currency ? "red.300" : null}
                                            >
                                                <option value="$">US Dollars:$</option>
                                            </Select>
                                            <Text mb='10px' color={'red'}> {formik?.errors.currency && formik?.touched.currency && formik?.errors.currency}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("currency", data?.currency, "Currency")}>{data?.currency ? data?.currency : ' - '}</Text>
                                }
                            </GridItem>


                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Total</Text>
                                {
                                    editableField === "total" ?
                                        <>
                                            <Input
                                                name="total"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.total}
                                                borderColor={formik?.errors?.total && formik?.touched?.total ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.total && formik?.touched.total && formik?.errors.total}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("total", data?.total, "Total")}>{data?.total ? data?.total : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Discount</Text>
                                {
                                    editableField === "discount" ?
                                        <>
                                            <Input
                                                name="discount"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.discount}
                                                borderColor={formik?.errors?.discount && formik?.touched?.discount ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.discount && formik?.touched.discount && formik?.errors.discount}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("discount", data?.discount, "Discount")}>{data?.discount ? data?.discount : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Subtotal</Text>
                                {
                                    editableField === "subtotal" ?
                                        <>
                                            <Input
                                                name="subtotal"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.subtotal}
                                                borderColor={formik?.errors?.subtotal && formik?.touched?.subtotal ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.subtotal && formik?.touched.subtotal && formik?.errors.subtotal}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("subtotal", data?.subtotal, "Subtotal")}>{data?.subtotal ? data?.subtotal : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Shipping</Text>
                                {
                                    editableField === "shipping" ?
                                        <>
                                            <Input
                                                name="shipping"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.shipping}
                                                borderColor={formik?.errors?.shipping && formik?.touched?.shipping ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.shipping && formik?.touched.shipping && formik?.errors.shipping}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("shipping", data?.shipping, "Shipping")}>{data?.shipping ? data?.shipping : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Shipping Tax</Text>
                                {
                                    editableField === "shippingTax" ?
                                        <>
                                            <Input
                                                name="shippingTax"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.shippingTax}
                                                borderColor={formik?.errors?.shippingTax && formik?.touched?.shippingTax ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.shippingTax && formik?.touched.shippingTax && formik?.errors.shippingTax}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("shippingTax", data?.shippingTax, "Shipping Tax")}>{data?.shippingTax ? data?.shippingTax : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Tax</Text>
                                {
                                    editableField === "tax" ?
                                        <>
                                            <Input
                                                name="tax"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.tax}
                                                borderColor={formik?.errors?.tax && formik?.touched?.tax ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.tax && formik?.touched.tax && formik?.errors.tax}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("tax", data?.tax, "Tax")}>{data?.tax ? data?.tax : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>Grand Total</Text>
                                {
                                    editableField === "grandTotal" ?
                                        <>
                                            <Input
                                                name="grandTotal"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.grandTotal}
                                                borderColor={formik?.errors?.grandTotal && formik?.touched?.grandTotal ? "red.300" : null}
                                                autoFocus
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.grandTotal && formik?.touched.grandTotal && formik?.errors.grandTotal}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("grandTotal", data?.grandTotal, "Grand Total")}>{data?.grandTotal ? data?.grandTotal : ' - '}</Text>
                                }
                            </GridItem>


                            {/* <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Task reminder </Text>
                                <Text>{data?.reminder ? data?.reminder : ' - '}</Text>
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Assign To  </Text>
                                <Link to={data?.assignTo ? contactAccess?.view && `/contactView/${data?.assignTo}` : leadAccess?.view && `/leadView/${data?.assignToLead}`}>
                                    <Text color={(data?.category === 'contact' && (contactAccess?.view || user?.role === 'superAdmin')) ? 'brand.600' : (leadAccess?.view || user?.role === 'superAdmin' && data?.category === 'lead') ? 'brand.600' : 'blackAlpha.900'} sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}>{data?.assignToName ? data?.assignToName : ' - '}</Text>
                                </Link>
                            </GridItem>
                            <GridItem colSpan={{ base: 2, md: 1 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Task createBy </Text>
                                <Text>{data?.createByName ? data?.createByName : ' - '}</Text>
                            </GridItem>
                            <GridItem colSpan={{ base: 2 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Task Description</Text>
                                {
                                    editableField === "description" ?
                                        <>
                                            <Input
                                                id="text"
                                                name="description"
                                                type="text"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.description}
                                                autoFocus
                                                borderColor={formik?.errors?.description && formik?.touched?.description ? "red.300" : null}
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.description && formik?.touched.description && formik?.errors.description}</Text>
                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("description", data?.description)}>{data?.description ? data?.description : ' - '}</Text>
                                }
                            </GridItem>
                            <GridItem colSpan={{ base: 2 }} >
                                <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Task notes </Text>
                                {
                                    editableField === "notes" ?
                                        <>
                                            <Input
                                                id="text"
                                                name="notes"
                                                type="text"
                                                onChange={formik.handleChange}
                                                onBlur={handleBlur}
                                                value={formik.values.notes}
                                                autoFocus
                                                borderColor={formik?.errors?.notes && formik?.touched?.notes ? "red.300" : null}
                                            />
                                            <Text mb='10px' color={'red'}> {formik?.errors.notes && formik?.touched.notes && formik?.errors.notes}</Text>

                                        </>
                                        :
                                        <Text onDoubleClick={() => handleDoubleClick("notes", data?.notes)}>{data?.notes ? data?.notes : ' - '}</Text>
                                }
                            </GridItem> */}
                        </Grid>
                    </Card>
                </GridItem>

            </Grid>
            {
                (permission?.update || permission?.delete || user?.role === 'superAdmin') && <Card mt={3}>
                    <Grid templateColumns="repeat(6, 1fr)" gap={1}>
                        <GridItem colStart={6} >
                            <Flex justifyContent={"right"}>
                                {(permission?.update || user?.role === 'superAdmin') && <Button size="sm" onClick={() => { setEdit(true); setType("edit") }} leftIcon={<EditIcon />} mr={2.5} variant="outline" colorScheme="green">Edit</Button>}
                                {(permission?.delete || user?.role === 'superAdmin') && <Button size="sm" style={{ background: 'red.800' }} onClick={() => setDeleteManyModel(true)} leftIcon={<DeleteIcon />} colorScheme="red" >Delete</Button>}
                            </Flex>
                        </GridItem>
                    </Grid>
                </Card>
            }
            <AddEdit isOpen={edit} size="lg" onClose={() => setEdit(false)} viewClose={onClose} selectedId={id?.event ? id?.event?._def?.extendedProps?._id : id} type={type} />
            <CommonDeleteModel isOpen={deleteManyModel} onClose={() => setDeleteManyModel(false)} type='Account' handleDeleteData={handleDeleteAccount} ids={[id]} />
        </div >
    )
}

export default View
